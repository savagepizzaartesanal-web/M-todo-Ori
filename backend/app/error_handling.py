"""Global safe exception handling middleware for the Metodo ORI API.

``SafeExceptionMiddleware`` is a pure ASGI middleware placed between
``CORSMiddleware`` and the application's own middlewares/router. Its only
job is to make sure that, when an unexpected exception escapes the normal
FastAPI routing/handling path (i.e. reaches this layer before a response
has started), the client always receives a generic, safe HTTP 500 response
instead of an unhandled server error propagating further up the stack -
while never leaking internal details (messages, tracebacks, request data)
to the client or to logs.

Expected exceptions (``HTTPException`` / ``RequestValidationError``) that
would normally be converted into a proper HTTP response by FastAPI's
``ExceptionMiddleware`` are not affected by this middleware on the regular
route path, because ``ExceptionMiddleware`` sits *inside* this middleware
and already turns them into ordinary ASGI responses before they can
propagate here. This middleware only needs to special-case those exception
types for the (narrower) situation where they are raised by a middleware
that sits *outside* ``ExceptionMiddleware`` (e.g. the app's rate limiter),
so that their original status/detail/headers contract is preserved instead
of being masked as a generic 500.
"""

from __future__ import annotations

import logging
from types import TracebackType

from fastapi.exception_handlers import (
    http_exception_handler,
    request_validation_exception_handler,
)
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from starlette.requests import Request
from starlette.types import ASGIApp, Message, Receive, Scope, Send

logger = logging.getLogger("app.error_handling")

_INTERNAL_ERROR_BODY = b'{"detail":"Internal server error"}'
_INTERNAL_ERROR_HEADERS = [(b"content-type", b"application/json")]


def _innermost_frame_location(tb: TracebackType | None) -> tuple[str | None, str | None, int | None]:
    """Return (filename, function, lineno) for the deepest frame of ``tb``.

    This is a minimal structural location (no source lines, no locals, no
    surrounding traceback text) used purely for safe server-side
    diagnostics.
    """

    filename: str | None = None
    function: str | None = None
    lineno: int | None = None

    frame = tb
    while frame is not None:
        filename = frame.tb_frame.f_code.co_filename
        function = frame.tb_frame.f_code.co_name
        lineno = frame.tb_lineno
        frame = frame.tb_next

    return filename, function, lineno


class SafeExceptionMiddleware:
    """Pure ASGI middleware guaranteeing a safe response for unexpected
    exceptions that reach it before a response has started.
    """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        response_started = False

        async def send_wrapper(message: Message) -> None:
            nonlocal response_started
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except (HTTPException, RequestValidationError) as exc:
            if response_started:
                self._log_late_error(scope, exc)
                raise

            await self._respond_expected(scope, receive, send, exc)
        except Exception as exc:  # noqa: BLE001 - intentional last-resort safety net
            if response_started:
                self._log_late_error(scope, exc)
                raise

            self._log_unexpected(scope, exc)
            await self._send_generic_500(send)

    async def _respond_expected(
        self,
        scope: Scope,
        receive: Receive,
        send: Send,
        exc: HTTPException | RequestValidationError,
    ) -> None:
        request = Request(scope, receive=receive)
        if isinstance(exc, RequestValidationError):
            response = await request_validation_exception_handler(request, exc)
        else:
            response = await http_exception_handler(request, exc)
        await response(scope, receive, send)

    async def _send_generic_500(self, send: Send) -> None:
        await send(
            {
                "type": "http.response.start",
                "status": 500,
                "headers": _INTERNAL_ERROR_HEADERS,
            }
        )
        await send({"type": "http.response.body", "body": _INTERNAL_ERROR_BODY})

    def _log_unexpected(self, scope: Scope, exc: BaseException) -> None:
        filename, function, lineno = _innermost_frame_location(exc.__traceback__)
        logger.error(
            "unhandled_exception",
            extra={
                "event": "unhandled_exception",
                "exception_class": exc.__class__.__name__,
                "method": scope.get("method"),
                "path": scope.get("path"),
                # NOTE: "filename" and "lineno" are reserved LogRecord
                # attribute names, so the source-location fields are
                # namespaced here to avoid a logging KeyError.
                "src_filename": filename,
                "src_function": function,
                "src_lineno": lineno,
            },
        )

    def _log_late_error(self, scope: Scope, exc: BaseException) -> None:
        # KNOWN_LIMITATION_NOT_BLOCKING_CURRENT_OBS2: once a response has
        # started, we cannot send a second HTTP response for it. We only
        # emit a safe diagnostic and re-raise so outer layers (e.g. the
        # ASGI server) are aware something went wrong after bytes were
        # already sent to the client.
        filename, function, lineno = _innermost_frame_location(exc.__traceback__)
        logger.error(
            "late_unhandled_exception_after_response_started",
            extra={
                "event": "late_unhandled_exception_after_response_started",
                "exception_class": exc.__class__.__name__,
                "method": scope.get("method"),
                "path": scope.get("path"),
                "src_filename": filename,
                "src_function": function,
                "src_lineno": lineno,
            },
        )
