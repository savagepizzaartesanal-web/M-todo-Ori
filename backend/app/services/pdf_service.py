from __future__ import annotations

import base64
import mimetypes
import re
import textwrap
from dataclasses import dataclass, field
from datetime import datetime
from html import escape
import logging
from pathlib import Path

from app.schemas.produto1 import Produto1RelatorioResponse

logger = logging.getLogger(__name__)


PAGE_WIDTH = 595
PAGE_HEIGHT = 842
MARGIN_X = 54
MARGIN_TOP = 64
MARGIN_BOTTOM = 58
GOLD = (0.78, 0.52, 0.27)
GOLD_LIGHT = (0.91, 0.69, 0.42)
INK = (0.13, 0.08, 0.06)
SOFT_INK = (0.32, 0.23, 0.18)
PAPER = (0.94, 0.88, 0.78)
PAPER_SOFT = (0.98, 0.94, 0.86)
DARK = (0.04, 0.02, 0.02)
DARK_PANEL = (0.10, 0.05, 0.04)
PUBLIC_DIR = Path(__file__).resolve().parents[3] / "metodo-ori" / "public"
LOGO_PATH = PUBLIC_DIR / "images" / "logo" / "logo-ori.png"
MASTER_BG_PATH = PUBLIC_DIR / "images" / "backgrounds" / "master-bg.png"
REPORT_BG_PATH = PUBLIC_DIR / "images" / "backgrounds" / "fundo-relatorio-pdf.png"
REPORT_COVER_PATHS = {
    "Amante Nutridora": "images/report-covers/amante-nutridora-mobile.png",
    "Autônoma Absoluta": "images/report-covers/autonoma-absoluta-mobile.png",
    "Cuidadora Estratégica": "images/report-covers/cuidadora-estrategica-mobile.png",
    "Guardiã Sensível": "images/report-covers/guardia-sensivel-mobile.png",
    "Matriarca Soberana": "images/report-covers/matriarca-soberana-mobile.png",
    "Musa Enigmática": "images/report-covers/musa-enigmática-mobile.png",
    "Protetora Selvagem": "images/report-covers/protetora-selvagem-mobile.png",
    "Rainha Magnética": "images/report-covers/rainha-magnetica-mobile.png",
    "Rainha Oculta": "images/report-covers/rainha-oculta-mobile.png",
    "Sedutora Estratégica": "images/report-covers/sedutora-estrategica-mobile.png",
    "Selvagem Intuitiva": "images/report-covers/selvagem-intuitiva-mobile.png",
    "Selvagem Magnética": "images/report-covers/selvagem-magnética-mobile.png",
    "Soberana Estratégica": "images/report-covers/soberana-estrategica-mobile.png",
    "Soberana Indomável": "images/report-covers/sobera-indomavel-mobile.png",
    "Visionária Sutil": "images/report-covers/visionaria-sutil-mobile.png",
}
ARCHETYPE_IMAGE_PATHS = {
    "Amante Nutridora": "images/archetypes/amante-nutridora.png",
    "Autônoma Absoluta": "images/archetypes/autonoma-absoluta.png",
    "Cuidadora Estratégica": "images/archetypes/cuidadora-estrategica.png",
    "Guardiã Sensível": "images/archetypes/guardia-sensivel.png",
    "Matriarca Soberana": "images/archetypes/matriarca-soberana.png",
    "Musa Enigmática": "images/archetypes/musa-enigmatica.png",
    "Protetora Selvagem": "images/archetypes/protetora-selvagem.png",
    "Rainha Magnética": "images/archetypes/rainha-magnetica.png",
    "Rainha Oculta": "images/archetypes/rainha-oculta.png",
    "Sedutora Estratégica": "images/archetypes/sedutora-estrategica.png",
    "Selvagem Magnética": "images/archetypes/selvagem-magnetica.png",
    "Selvagem Intuitiva": "images/archetypes/selvagem-intuitiva.png",
    "Soberana Estratégica": "images/archetypes/soberana-estrategica.png",
    "Soberana Indomável": "images/archetypes/soberana-indomavel.png",
    "Visionária Sutil": "images/archetypes/visionaria-sutil.png",
}


def slugify_filename(value: str) -> str:
    normalized = value.lower()
    normalized = (
        normalized.replace("á", "a")
        .replace("à", "a")
        .replace("â", "a")
        .replace("ã", "a")
        .replace("é", "e")
        .replace("ê", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ô", "o")
        .replace("õ", "o")
        .replace("ú", "u")
        .replace("ç", "c")
    )
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    return normalized or "codigo-das-deusas"


def get_report_pdf_filename(report: Produto1RelatorioResponse) -> str:
    return f"codigo-das-deusas-{slugify_filename(report.resultado)}.pdf"


def _escape_pdf_text(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .replace("\r", " ")
    )


def _rgb(color: tuple[float, float, float]) -> str:
    return " ".join(f"{channel:.3f}" for channel in color)


@dataclass
class PdfPage:
    operations: list[str] = field(default_factory=list)
    dark: bool = False

    def rect(
        self,
        x: int,
        y: int,
        width: int,
        height: int,
        *,
        fill: tuple[float, float, float] | None = None,
        stroke: tuple[float, float, float] | None = None,
    ) -> None:
        if fill and stroke:
            self.operations.append(
                f"{_rgb(fill)} rg {_rgb(stroke)} RG {x} {y} {width} {height} re B"
            )
        elif fill:
            self.operations.append(f"{_rgb(fill)} rg {x} {y} {width} {height} re f")
        elif stroke:
            self.operations.append(f"{_rgb(stroke)} RG {x} {y} {width} {height} re S")

    def text(
        self,
        x: int,
        y: int,
        value: str,
        *,
        size: int = 11,
        bold: bool = False,
        color: tuple[float, float, float] = INK,
    ) -> None:
        font = "F2" if bold else "F1"
        safe_value = _escape_pdf_text(value)
        self.operations.append(
            f"{_rgb(color)} rg BT /{font} {size} Tf {x} {y} Td ({safe_value}) Tj ET"
        )

    def line(
        self,
        x1: int,
        y1: int,
        x2: int,
        y2: int,
        *,
        color: tuple[float, float, float] = GOLD,
    ) -> None:
        self.operations.append(f"{_rgb(color)} RG {x1} {y1} m {x2} {y2} l S")


class SimplePdfDocument:
    def __init__(self) -> None:
        self.pages: list[PdfPage] = []
        self.current_page = self._new_page(dark=True)
        self.y = PAGE_HEIGHT - MARGIN_TOP

    def _new_page(self, *, dark: bool = False) -> PdfPage:
        page = PdfPage(dark=dark)
        self.pages.append(page)
        if dark:
            page.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=DARK)
            page.rect(34, 34, PAGE_WIDTH - 68, PAGE_HEIGHT - 68, stroke=GOLD)
            page.rect(52, 52, PAGE_WIDTH - 104, PAGE_HEIGHT - 104, stroke=(0.25, 0.15, 0.08))
        else:
            page.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=PAPER_SOFT)
            page.rect(34, 34, PAGE_WIDTH - 68, PAGE_HEIGHT - 68, stroke=(0.82, 0.67, 0.45))
            page.rect(44, 44, PAGE_WIDTH - 88, PAGE_HEIGHT - 88, fill=PAPER, stroke=(0.86, 0.72, 0.50))
        return page

    def add_page(self, *, dark: bool = False) -> None:
        self.current_page = self._new_page(dark=dark)
        self.y = PAGE_HEIGHT - MARGIN_TOP

    def ensure_space(self, height: int) -> None:
        if self.y - height < MARGIN_BOTTOM:
            self.add_page()

    def add_label(self, value: str) -> None:
        self.ensure_space(22)
        color = GOLD_LIGHT if self.current_page.dark else GOLD
        self.current_page.text(MARGIN_X, self.y, value.upper(), size=8, bold=True, color=color)
        self.y -= 18

    def add_heading(self, value: str, *, size: int = 24) -> None:
        lines = textwrap.wrap(value, width=34 if size >= 22 else 46)
        self.ensure_space(32 * len(lines) + 8)
        color = GOLD_LIGHT if self.current_page.dark else INK
        for line in lines:
            self.current_page.text(MARGIN_X, self.y, line, size=size, bold=True, color=color)
            self.y -= int(size * 1.28)
        self.y -= 8

    def add_paragraph(
        self,
        value: str,
        *,
        size: int = 11,
        width: int = 88,
        color: tuple[float, float, float] | None = None,
        indent: int = 0,
    ) -> None:
        paragraphs = [part.strip() for part in value.split("\n") if part.strip()]
        text_color = color or (PAPER if self.current_page.dark else INK)

        for paragraph in paragraphs:
            lines = textwrap.wrap(paragraph, width=width)
            self.ensure_space(max(18, len(lines) * 16 + 8))
            for line in lines:
                self.current_page.text(MARGIN_X + indent, self.y, line, size=size, color=text_color)
                self.y -= 15
            self.y -= 7

    def add_chip_row(self, values: list[str]) -> None:
        chips = [value for value in values if value]
        if not chips:
            return

        self.ensure_space(38)
        x = MARGIN_X
        for value in chips[:3]:
            label = value[:38]
            width = min(170, max(86, len(label) * 5 + 28))
            self.current_page.rect(x, self.y - 18, width, 25, fill=DARK_PANEL, stroke=(0.28, 0.18, 0.10))
            self.current_page.text(x + 12, self.y - 9, label, size=8, color=PAPER)
            x += width + 8
        self.y -= 46

    def add_feature_box(self, label: str, value: str) -> None:
        lines = textwrap.wrap(value, width=78)
        height = max(54, len(lines) * 15 + 34)
        self.ensure_space(height + 12)
        self.current_page.rect(
            MARGIN_X,
            self.y - height,
            PAGE_WIDTH - (MARGIN_X * 2),
            height,
            fill=(0.91, 0.84, 0.72),
            stroke=(0.78, 0.58, 0.34),
        )
        self.current_page.text(MARGIN_X + 16, self.y - 20, label.upper(), size=8, bold=True, color=GOLD)
        cursor_y = self.y - 40
        for line in lines:
            self.current_page.text(MARGIN_X + 16, cursor_y, line, size=10, color=INK)
            cursor_y -= 14
        self.y -= height + 12

    def add_divider(self) -> None:
        self.ensure_space(18)
        self.current_page.line(MARGIN_X, self.y, PAGE_WIDTH - MARGIN_X, self.y)
        self.y -= 22

    def add_section_start(self, label: str) -> None:
        self.ensure_space(58)
        self.current_page.text(MARGIN_X, self.y, label.upper(), size=9, bold=True, color=GOLD)
        self.y -= 18
        self.current_page.line(MARGIN_X, self.y, PAGE_WIDTH - MARGIN_X, self.y, color=(0.76, 0.56, 0.34))
        self.y -= 24

    def add_footers(self) -> None:
        internal_pages = [page for page in self.pages if not page.dark]
        total = len(internal_pages)
        current = 0

        for page in self.pages:
            if page.dark:
                page.text(MARGIN_X, 56, "Método ORI by Telúrica", size=9, color=GOLD_LIGHT)
                continue

            current += 1
            page.line(MARGIN_X, 54, PAGE_WIDTH - MARGIN_X, 54, color=(0.78, 0.64, 0.44))
            page.text(MARGIN_X, 36, "Método ORI by Telúrica · Código das Deusas", size=8, color=SOFT_INK)
            page.text(PAGE_WIDTH - MARGIN_X - 42, 36, f"{current}/{total}", size=8, color=SOFT_INK)

    def to_bytes(self) -> bytes:
        self.add_footers()
        objects: list[bytes] = []
        page_object_numbers = []

        objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")

        for index, page in enumerate(self.pages):
            page_obj_number = 5 + (index * 2)
            content_obj_number = page_obj_number + 1
            page_object_numbers.append(page_obj_number)
            content = "\n".join(page.operations).encode("latin-1", errors="replace")
            objects.append(
                (
                    f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
                    f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> "
                    f"/Contents {content_obj_number} 0 R >>"
                ).encode("latin-1")
            )
            objects.append(
                b"<< /Length " + str(len(content)).encode("latin-1") + b" >>\nstream\n" + content + b"\nendstream"
            )

        pages = " ".join(f"{number} 0 R" for number in page_object_numbers)
        objects.insert(
            1,
            f"<< /Type /Pages /Kids [{pages}] /Count {len(page_object_numbers)} >>".encode("latin-1"),
        )
        objects.insert(2, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
        objects.insert(3, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")

        pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        offsets = [0]
        for index, obj in enumerate(objects, start=1):
            offsets.append(len(pdf))
            pdf.extend(f"{index} 0 obj\n".encode("latin-1"))
            pdf.extend(obj)
            pdf.extend(b"\nendobj\n")

        xref_offset = len(pdf)
        pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
        pdf.extend(b"0000000000 65535 f \n")
        for offset in offsets[1:]:
            pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
        pdf.extend(
            (
                f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
                f"startxref\n{xref_offset}\n%%EOF\n"
            ).encode("latin-1")
        )
        return bytes(pdf)


def build_produto1_report_pdf_basic(report: Produto1RelatorioResponse) -> bytes:
    doc = SimplePdfDocument()

    doc.add_label("Relatório digital · Código das Deusas")
    doc.add_heading(report.resultado, size=32)
    if report.subtitle:
        doc.add_paragraph(report.subtitle, size=13, width=66, color=PAPER)

    doc.add_chip_row([report.combinacao, report.formula, report.email])

    doc.add_page()
    doc.add_section_start("Pontos considerados na sua leitura")

    perfil = report.perfil
    profile_items = [
        ("Momento atual", perfil.momento_atual),
        ("O que mais pesa hoje", perfil.dor_atual),
        ("Objetivo principal", perfil.objetivo_principal),
    ]
    for label, value in profile_items:
        if value:
            doc.add_feature_box(label, value)

    if report.highlights:
        doc.add_section_start("O que o ORI leu no seu mapa")
        for highlight in report.highlights:
            doc.add_label(highlight.label)
            doc.add_paragraph(highlight.text, size=10, width=84, color=SOFT_INK)

    for section in report.sections:
        doc.add_page()
        doc.add_section_start(section.title)
        doc.add_paragraph(section.text, size=10, width=84, color=INK)

    if report.next_step:
        doc.add_page()
        doc.add_section_start("Próximo passo")
        doc.add_feature_box("Continuidade da jornada", report.next_step)

    doc.add_divider()
    doc.add_paragraph(
        f"Gerado pelo Método ORI em {datetime.now().strftime('%d/%m/%Y')}.",
        size=8,
        width=88,
        color=SOFT_INK,
    )

    return doc.to_bytes()


def _wrap_reportlab_text(
    canvas_obj,
    text: str,
    *,
    x: int,
    y: int,
    max_width: int,
    font_name: str = "Helvetica",
    font_size: int = 34,
    leading: int | None = None,
    color=None,
) -> int:
    from reportlab.pdfbase.pdfmetrics import stringWidth

    leading = leading or int(font_size * 1.38)
    canvas_obj.setFont(font_name, font_size)
    if color is not None:
        canvas_obj.setFillColor(color)

    paragraphs = [part.strip() for part in text.split("\n") if part.strip()]
    current_y = y

    for paragraph in paragraphs:
        words = paragraph.split()
        line = ""
        for word in words:
            test_line = f"{line} {word}".strip()
            if stringWidth(test_line, font_name, font_size) <= max_width:
                line = test_line
                continue

            if line:
                canvas_obj.drawString(x, current_y, line)
                current_y -= leading
            line = word

        if line:
            canvas_obj.drawString(x, current_y, line)
            current_y -= leading
        current_y -= int(leading * 0.35)

    return current_y


def _draw_reportlab_image_cover(canvas_obj, image_path: Path, *, width: int, height: int) -> None:
    from reportlab.lib.utils import ImageReader

    if not image_path.exists():
        return

    image = ImageReader(str(image_path))
    img_width, img_height = image.getSize()
    scale = max(width / img_width, height / img_height)
    draw_width = img_width * scale
    draw_height = img_height * scale
    x = (width - draw_width) / 2
    y = (height - draw_height) / 2
    canvas_obj.drawImage(image, x, y, draw_width, draw_height, mask="auto")


def _reportlab_set_alpha(canvas_obj, value: float) -> None:
    try:
        canvas_obj.setFillAlpha(value)
        canvas_obj.setStrokeAlpha(value)
    except Exception:
        return


def build_produto1_report_pdf_reportlab(report: Produto1RelatorioResponse) -> bytes:
    from io import BytesIO

    from reportlab.lib.colors import Color, HexColor
    from reportlab.lib.pagesizes import portrait
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfgen import canvas

    page_width, page_height = 1080, 1920
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=portrait((page_width, page_height)))

    gold = HexColor("#f3ad61")
    soft = HexColor("#f5e6d7")
    muted = HexColor("#bca99a")
    dark = HexColor("#050202")
    panel = HexColor("#160908")
    line = HexColor("#7b4b25")
    cover_relative = REPORT_COVER_PATHS.get(report.resultado)
    cover_path = PUBLIC_DIR / cover_relative if cover_relative else None

    def draw_base_page() -> None:
        if REPORT_BG_PATH.exists():
            _draw_reportlab_image_cover(pdf, REPORT_BG_PATH, width=page_width, height=page_height)
        else:
            pdf.setFillColor(dark)
            pdf.rect(0, 0, page_width, page_height, fill=1, stroke=0)

        pdf.setFillColor(Color(0.02, 0.008, 0.006, alpha=0.74))
        _reportlab_set_alpha(pdf, 0.74)
        pdf.rect(0, 0, page_width, page_height, fill=1, stroke=0)
        _reportlab_set_alpha(pdf, 1)

        pdf.setStrokeColor(line)
        pdf.setLineWidth(1.2)
        pdf.roundRect(64, 72, page_width - 128, page_height - 144, 34, fill=0, stroke=1)
        pdf.setStrokeColor(HexColor("#3a2113"))
        pdf.roundRect(92, 102, page_width - 184, page_height - 204, 28, fill=0, stroke=1)

    def draw_footer() -> None:
        pdf.setFillColor(HexColor("#8f6240"))
        pdf.setFont("Helvetica", 13)
        pdf.drawString(100, 76, "MÉTODO ORI BY TELÚRICA · CÓDIGO DAS DEUSAS")

    def draw_label(text: str, x: int, y: int) -> None:
        pdf.setStrokeColor(gold)
        pdf.setLineWidth(2)
        pdf.line(x, y + 9, x + 42, y + 9)
        pdf.setFillColor(gold)
        pdf.setFont("Helvetica", 14)
        pdf.drawString(x + 62, y, text.upper())

    def draw_chip(text: str, x: int, y: int, width: int) -> None:
        pdf.setFillColor(Color(0.10, 0.05, 0.04, alpha=0.72))
        _reportlab_set_alpha(pdf, 0.72)
        pdf.roundRect(x, y, width, 42, 21, fill=1, stroke=0)
        _reportlab_set_alpha(pdf, 1)
        pdf.setStrokeColor(HexColor("#5b3820"))
        pdf.roundRect(x, y, width, 42, 21, fill=0, stroke=1)
        pdf.setFillColor(muted)
        pdf.setFont("Helvetica", 12)
        pdf.drawCentredString(x + width / 2, y + 14, text[:38])

    def draw_cover() -> None:
        pdf.setFillColor(dark)
        pdf.rect(0, 0, page_width, page_height, fill=1, stroke=0)

        if cover_path and cover_path.exists():
            _draw_reportlab_image_cover(pdf, cover_path, width=page_width, height=page_height)

        pdf.setFillColor(Color(0.02, 0.008, 0.006, alpha=0.80))
        _reportlab_set_alpha(pdf, 0.80)
        pdf.rect(0, 0, page_width, page_height, fill=1, stroke=0)
        _reportlab_set_alpha(pdf, 1)

        pdf.setStrokeColor(line)
        pdf.setLineWidth(1.4)
        pdf.roundRect(64, 72, page_width - 128, page_height - 144, 40, fill=0, stroke=1)
        pdf.roundRect(92, 102, page_width - 184, page_height - 204, 34, fill=0, stroke=1)

        if LOGO_PATH.exists():
            logo = ImageReader(str(LOGO_PATH))
            logo_width, logo_height = logo.getSize()
            draw_width = 280
            draw_height = draw_width * logo_height / logo_width
            pdf.drawImage(logo, (page_width - draw_width) / 2, 1480, draw_width, draw_height, mask="auto")

        draw_label("Relatório digital · Código das Deusas", 150, 1365)
        pdf.setFillColor(gold)
        pdf.setFont("Helvetica-Bold", 78)
        title_y = 1262
        for title_line in textwrap.wrap(report.resultado, width=18):
            pdf.drawString(150, title_y, title_line)
            title_y -= 86

        pdf.setFillColor(soft)
        subtitle_y = title_y - 20
        _wrap_reportlab_text(
            pdf,
            report.subtitle,
            x=150,
            y=subtitle_y,
            max_width=720,
            font_name="Helvetica",
            font_size=28,
            leading=42,
            color=soft,
        )

        chip_y = 780
        draw_chip(report.combinacao, 150, chip_y, 190)
        draw_chip(report.formula, 360, chip_y, 280)
        draw_chip(report.email, 660, chip_y, 250)
        draw_footer()
        pdf.showPage()

    def draw_text_page(title: str, text: str, *, label: str = "Leitura arquetípica") -> None:
        draw_base_page()
        draw_label(label, 150, 1570)
        pdf.setFillColor(gold)
        pdf.setFont("Helvetica-Bold", 46)
        title_y = 1478
        for line_text in textwrap.wrap(title, width=24):
            pdf.drawString(150, title_y, line_text)
            title_y -= 56

        cursor_y = title_y - 18
        pdf.setFillColor(soft)
        first_paragraph, *rest = [part.strip() for part in text.split("\n\n") if part.strip()]
        if first_paragraph:
            pdf.setFillColor(Color(0.16, 0.09, 0.06, alpha=0.78))
            _reportlab_set_alpha(pdf, 0.78)
            pdf.roundRect(150, cursor_y - 138, 780, 138, 18, fill=1, stroke=0)
            _reportlab_set_alpha(pdf, 1)
            pdf.setStrokeColor(HexColor("#5d3820"))
            pdf.roundRect(150, cursor_y - 138, 780, 138, 18, fill=0, stroke=1)
            cursor_y = _wrap_reportlab_text(
                pdf,
                first_paragraph,
                x=176,
                y=cursor_y - 42,
                max_width=728,
                font_name="Helvetica-Bold",
                font_size=24,
                leading=34,
                color=soft,
            ) - 38

        body = "\n\n".join(rest)
        if body:
            _wrap_reportlab_text(
                pdf,
                body,
                x=150,
                y=cursor_y,
                max_width=780,
                font_name="Helvetica",
                font_size=22,
                leading=34,
                color=soft,
            )

        draw_footer()
        pdf.showPage()

    def draw_map_page() -> None:
        draw_base_page()
        draw_label("Mapa da leitura", 150, 1570)
        pdf.setFillColor(gold)
        pdf.setFont("Helvetica-Bold", 48)
        pdf.drawString(150, 1480, "O que foi considerado")
        pdf.drawString(150, 1422, "antes da revelação")

        y = 1285
        cards = [
            ("O que suas respostas mostraram", report.highlights[0].text if report.highlights else ""),
            ("O que seu perfil trouxe", report.highlights[1].text if len(report.highlights) > 1 else ""),
        ]
        for card_title, card_text in cards:
            pdf.setFillColor(Color(0.16, 0.09, 0.06, alpha=0.72))
            _reportlab_set_alpha(pdf, 0.72)
            pdf.roundRect(150, y - 210, 780, 210, 18, fill=1, stroke=0)
            _reportlab_set_alpha(pdf, 1)
            pdf.setStrokeColor(HexColor("#5d3820"))
            pdf.roundRect(150, y - 210, 780, 210, 18, fill=0, stroke=1)
            pdf.setFillColor(gold)
            pdf.setFont("Helvetica-Bold", 15)
            pdf.drawString(176, y - 48, card_title.upper())
            _wrap_reportlab_text(
                pdf,
                card_text,
                x=176,
                y=y - 88,
                max_width=720,
                font_name="Helvetica",
                font_size=22,
                leading=32,
                color=soft,
            )
            y -= 270
        draw_footer()
        pdf.showPage()

    draw_cover()
    draw_map_page()
    for section in report.sections:
        draw_text_page(section.title, section.text)
    if report.next_step:
        draw_text_page("O movimento depois da leitura", report.next_step, label="Próximo passo")

    pdf.save()
    return buffer.getvalue()


def _format_paragraphs(value: str) -> str:
    parts = [part.strip() for part in value.split("\n\n") if part.strip()]
    if not parts:
        parts = [value.strip()] if value.strip() else []

    return "\n".join(f"<p>{escape(part)}</p>" for part in parts)


def _asset_data_uri(path: Path) -> str:
    if not path.exists():
        return ""

    mime_type = mimetypes.guess_type(path.name)[0] or "image/png"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def _logo_img_html() -> str:
    logo_uri = _asset_data_uri(LOGO_PATH)
    return f'<img class="logo" src="{logo_uri}" alt="Método ORI" />' if logo_uri else ""


def _archetype_image_data_uri(result_name: str) -> str:
    relative_path = ARCHETYPE_IMAGE_PATHS.get(result_name)
    if not relative_path:
        return ""

    return _asset_data_uri(PUBLIC_DIR / relative_path)


def _report_cover_image_data_uri(result_name: str) -> str:
    relative_path = REPORT_COVER_PATHS.get(result_name)
    if relative_path:
        cover_uri = _asset_data_uri(PUBLIC_DIR / relative_path)
        if cover_uri:
            return cover_uri

    return _archetype_image_data_uri(result_name)


def _section_card_html(section, *, compact: bool = False) -> str:
    compact_class = " compact-card" if compact else ""
    return f"""
      <article class="section-card{compact_class}">
        <p class="section-number">{escape(section.label)}</p>
        <h3>{escape(section.title)}</h3>
        <div class="section-text">
          {_format_paragraphs(section.text)}
        </div>
      </article>
    """


def _group_sections_into_pages(sections) -> str:
    pages = []
    for section in sections:
        pages.append(
            f"""
            <section class="page reading-page">
              <div class="page-frame reading-frame">
                <div class="label-line">
                  <span></span>
                  <p>Leitura arquetípica</p>
                </div>
                {_section_card_html(section)}
              </div>
            </section>
            """
        )

    return "\n".join(pages)


def build_produto1_report_html(report: Produto1RelatorioResponse) -> str:
    logo_html = _logo_img_html()
    report_bg_uri = _asset_data_uri(REPORT_BG_PATH)
    master_bg_uri = _asset_data_uri(MASTER_BG_PATH)
    page_background = (
        f"linear-gradient(180deg, rgba(5, 2, 2, 0.22), rgba(5, 2, 2, 0.34)), url('{report_bg_uri}')"
        if report_bg_uri
        else f"linear-gradient(135deg, rgba(8, 3, 3, 0.78) 0%, rgba(5, 2, 2, 0.90) 48%, rgba(31, 13, 8, 0.82) 100%), url('{master_bg_uri}')"
        if master_bg_uri
        else "radial-gradient(circle at 88% 10%, rgba(242, 185, 104, 0.20), transparent 28%), radial-gradient(circle at 6% 82%, rgba(116, 57, 34, 0.28), transparent 32%), linear-gradient(135deg, #120909 0%, #050202 58%, #130807 100%)"
    )
    cover_image_uri = _report_cover_image_data_uri(report.resultado)
    cover_image_style = (
        f"background-image: linear-gradient(90deg, rgba(5,2,2,0.97) 0%, rgba(5,2,2,0.84) 42%, rgba(5,2,2,0.10) 100%), url('{cover_image_uri}');"
        if cover_image_uri
        else ""
    )
    perfil = report.perfil
    profile_items = [
        ("Momento atual", perfil.momento_atual),
        ("O que mais pesa hoje", perfil.dor_atual),
        ("Objetivo principal", perfil.objetivo_principal),
    ]
    profile_cards = "\n".join(
        f"""
        <article class="profile-card">
          <p class="card-label">{escape(label)}</p>
          <p>{escape(value)}</p>
        </article>
        """
        for label, value in profile_items
        if value
    )
    highlights = "\n".join(
        f"""
        <article class="insight-card">
          <p class="card-label">{escape(item.label)}</p>
          <p>{escape(item.text)}</p>
        </article>
        """
        for item in report.highlights
    )
    sections = _group_sections_into_pages(report.sections)
    next_step = (
        f"""
        <section class="page final-page">
          <div class="page-frame">
            <div class="label-line">
              <span></span>
              <p>Próximo passo</p>
            </div>
            <h2>O movimento depois da leitura</h2>
            <div class="final-box">
              {_format_paragraphs(report.next_step)}
            </div>
            <p class="signature">Método ORI by Telúrica</p>
          </div>
        </section>
        """
        if report.next_step
        else ""
    )
    chips = [report.combinacao, report.formula, report.email]
    chips_html = "\n".join(
        f"<span>{escape(chip)}</span>" for chip in chips if chip
    )

    return f"""
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>{escape(report.title)}</title>
  <style>
    @page {{
      size: 1080px 1920px;
      margin: 0;
    }}

    * {{
      box-sizing: border-box;
    }}

    body {{
      margin: 0;
      background: #080404;
      color: #f6eadc;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }}

    .page {{
      position: relative;
      width: 1080px;
      min-height: 1920px;
      overflow: hidden;
      page-break-after: always;
      background-image: {page_background};
      background-size: cover;
      background-position: center;
    }}

    .page:not(.cover)::before {{
      background: rgba(3, 1, 1, 0.34);
      box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.30);
    }}

    .page::before {{
      content: "";
      position: absolute;
      inset: 56px;
      border: 1px solid rgba(242, 185, 104, 0.22);
      border-radius: 42px;
      pointer-events: none;
    }}

    .page::after {{
      content: "Método ORI by Telúrica · Código das Deusas";
      position: absolute;
      left: 92px;
      bottom: 58px;
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(246, 218, 177, 0.46);
    }}

    .cover {{
      display: block;
      padding: 0;
      background-color: #050202;
      {cover_image_style}
      background-size: cover;
      background-position: center center;
    }}

    .cover-panel {{
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      min-height: 1920px;
      padding: 190px 118px 112px;
      border: 0;
      border-radius: 0;
      overflow: hidden;
      background:
        linear-gradient(90deg, rgba(5, 2, 2, 0.86) 0%, rgba(5, 2, 2, 0.66) 42%, rgba(5, 2, 2, 0.16) 100%),
        linear-gradient(180deg, rgba(5, 2, 2, 0.12), rgba(5, 2, 2, 0.44));
      box-shadow: none;
    }}

    .cover-panel::before {{
      display: none;
    }}

    .cover-panel::after {{
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      background:
        radial-gradient(circle at 68% 30%, rgba(242,185,104,0.16), transparent 24%),
        radial-gradient(circle at 22% 56%, rgba(5,2,2,0.42), transparent 42%);
      pointer-events: none;
    }}

    .logo {{
      width: 280px;
      height: auto;
      display: block;
      margin: 0 auto 76px;
      opacity: 0.96;
    }}

    .label-line {{
      display: flex;
      align-items: center;
      gap: 18px;
      margin-bottom: 28px;
    }}

    .label-line span {{
      width: 42px;
      height: 1px;
      background: linear-gradient(90deg, #f2b968, transparent);
    }}

    .label-line p,
    .card-label {{
      margin: 0;
      color: #d49a52;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.34em;
      text-transform: uppercase;
    }}

    h1 {{
      margin: 0;
      max-width: 620px;
      color: #ffc06d;
      font-size: 92px;
      line-height: 0.94;
      letter-spacing: -0.04em;
      font-weight: 650;
    }}

    .subtitle {{
      max-width: 690px;
      margin: 34px 0 0;
      color: rgba(255, 245, 235, 0.82);
      font-size: 27px;
      line-height: 1.45;
    }}

    .chips {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 42px;
    }}

    .chips span {{
      padding: 12px 18px;
      border: 1px solid rgba(242, 185, 104, 0.18);
      border-radius: 999px;
      background: rgba(255,255,255,0.035);
      color: rgba(255,245,235,0.72);
      font-size: 12px;
      letter-spacing: 0.08em;
    }}

    .cover-footer {{
      display: flex;
      align-items: end;
      justify-content: space-between;
      color: rgba(255,245,235,0.58);
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }}

    .page-frame {{
      position: relative;
      z-index: 1;
      min-height: 1660px;
      margin: 104px;
      padding: 92px 66px;
    }}

    .map-page .page-frame {{
      display: flex;
      flex-direction: column;
      gap: 28px;
    }}

    h2 {{
      margin: 0 0 28px;
      color: #ffc06d;
      font-size: 54px;
      line-height: 1;
      letter-spacing: -0.035em;
      font-weight: 620;
    }}

    .profile-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }}

    .insight-grid {{
      display: grid;
      grid-template-columns: 1fr;
      gap: 18px;
    }}

    .profile-card,
    .insight-card,
    .final-box {{
      border: 1px solid rgba(242, 185, 104, 0.14);
      border-radius: 26px;
      background:
        radial-gradient(circle at 90% 8%, rgba(242,185,104,0.10), transparent 30%),
        rgba(255,255,255,0.035);
      padding: 28px;
    }}

    .profile-card p:last-child,
    .insight-card p:last-child,
    .final-box p {{
      margin: 8px 0 0;
      color: rgba(255,245,235,0.78);
      font-size: 21px;
      line-height: 1.58;
    }}

    .reading-frame {{
      display: flex;
      flex-direction: column;
      gap: 34px;
    }}

    .section-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
      align-items: start;
    }}

    .section-card {{
      width: 100%;
      max-width: 820px;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }}

    .reading-frame > .section-card {{
      min-height: auto;
    }}

    .section-card h3 {{
      margin: 0 0 34px;
      color: #ffc06d;
      font-size: 56px;
      line-height: 0.96;
      letter-spacing: -0.03em;
    }}

    .section-number {{
      margin: 0 0 16px;
      color: rgba(212,154,82,0.72);
      font-size: 14px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
    }}

    .section-text p {{
      margin: 0 0 28px;
      color: rgba(255,245,235,0.80);
      font-size: 24px;
      line-height: 1.62;
    }}

    .section-text p:first-child {{
      margin-bottom: 38px;
      padding: 0 0 0 30px;
      border-left: 1px solid rgba(242, 185, 104, 0.42);
      color: #fff0dd;
      font-size: 27px;
      line-height: 1.52;
    }}

    .compact-card .section-text p {{
      font-size: 14px;
      line-height: 1.5;
    }}

    .compact-card .section-text p:first-child {{
      font-size: 15px;
    }}

    .compact-card h3 {{
      font-size: 34px;
    }}

    .final-page .page-frame {{
      display: flex;
      flex-direction: column;
      justify-content: center;
    }}

    .signature {{
      margin-top: 42px;
      color: #ffc06d;
      font-size: 24px;
      letter-spacing: 0.04em;
    }}
  </style>
</head>
<body>
  <section class="page cover">
    <div class="cover-panel">
      <div>
        {logo_html}
        <div class="label-line">
          <span></span>
          <p>Relatório digital · Código das Deusas</p>
        </div>
        <h1>{escape(report.resultado)}</h1>
        <p class="subtitle">{escape(report.subtitle or "Sua primeira cartografia simbólica de imagem.")}</p>
        <div class="chips">{chips_html}</div>
      </div>
      <div class="cover-footer">
        <p>Imagem · Presença · Identidade</p>
        <p>{datetime.now().strftime("%d/%m/%Y")}</p>
      </div>
    </div>
  </section>

  <section class="page map-page">
    <div class="page-frame">
      <div>
        <div class="label-line">
          <span></span>
          <p>Mapa da leitura</p>
        </div>
        <h2>O que foi considerado antes da revelação</h2>
      </div>
      <div class="profile-grid">{profile_cards}</div>
      <div class="insight-grid">{highlights}</div>
    </div>
  </section>

  {sections}
  {next_step}
</body>
</html>
    """


async def build_produto1_report_pdf(report: Produto1RelatorioResponse) -> bytes:
    try:
        from playwright.async_api import async_playwright
    except ImportError as error:
        logger.warning("Playwright indisponivel para gerar PDF premium: %s", error)
        try:
            return build_produto1_report_pdf_reportlab(report)
        except Exception as reportlab_error:
            logger.exception("Falha ao gerar PDF premium com ReportLab: %s", reportlab_error)
            return build_produto1_report_pdf_basic(report)

    html = build_produto1_report_html(report)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(args=["--no-sandbox"])
            page = await browser.new_page(
                viewport={"width": 1080, "height": 1920},
                device_scale_factor=1,
            )
            await page.set_content(html, wait_until="networkidle")
            pdf = await page.pdf(
                width="1080px",
                height="1920px",
                print_background=True,
                prefer_css_page_size=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            )
            await browser.close()
            return pdf
    except Exception as error:
        logger.exception("Falha ao gerar PDF premium com Playwright. Usando fallback simples: %s", error)
        try:
            return build_produto1_report_pdf_reportlab(report)
        except Exception as reportlab_error:
            logger.exception("Falha ao gerar PDF premium com ReportLab: %s", reportlab_error)
            return build_produto1_report_pdf_basic(report)
