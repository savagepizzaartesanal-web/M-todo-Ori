from __future__ import annotations

import ast
import json
import re
from collections import defaultdict
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "metodo-ori"
BACKEND = ROOT / "backend"
OUT_DIR = FRONTEND / "revisao"
PDF_PATH = OUT_DIR / "revisao-comunicacao-textos-sistema.pdf"
JSON_PATH = OUT_DIR / "revisao-comunicacao-textos-sistema.json"


PAGE_BY_FILE = {
    "src/App.jsx": "Sistema geral / rotas",
    "src/layouts/DashboardLayout.jsx": "Layout autenticado",
    "src/components/Sidebar.jsx": "Menu lateral / navegação",
    "src/components/Topbar.jsx": "Topo / navegação",
    "src/components/ProtectedRoute.jsx": "Proteção de acesso",
    "src/components/AdminRoute.jsx": "Proteção administrativa",
    "src/pages/Login.jsx": "/entrar",
    "src/pages/RedefinirSenha.jsx": "/redefinir-senha",
    "src/pages/OnboardingOri.jsx": "/entrada-ori",
    "src/pages/PortalCliente.jsx": "/portal",
    "src/pages/Dashboard.jsx": "/",
    "src/pages/MetodoOri.jsx": "/metodo-ori",
    "src/pages/QuizProduto1.jsx": "/produto-1, /produto-1/leitura, /quiz-produto-1",
    "src/pages/Produto1.jsx": "Produto 1",
    "src/pages/Produto1Relatorio.jsx": "/produto-1/relatorio",
    "src/pages/Produto2.jsx": "/produto-2",
    "src/pages/Produto3.jsx": "/produto-3",
    "src/pages/EspelhoOri.jsx": "/espelho-ori",
    "src/pages/OraculoOri.jsx": "/oraculo",
    "src/pages/AdminDashboard.jsx": "/admin",
    "src/pages/AdminClientes.jsx": "/admin/clientes",
    "src/pages/AdminClienteDetalhe.jsx": "/admin/clientes/:id",
    "src/components/Produto2ReviewPanel.jsx": "/admin/clientes/:id / revisão Produto 2",
    "src/data/questions.js": "/produto-1 / quiz",
    "src/data/reports.js": "/produto-1/relatorio / relatório base",
    "src/data/onboardingOriSteps.js": "/entrada-ori / onboarding",
    "src/data/produto2Form.js": "/produto-2 / formulário",
    "src/data/cliente.js": "/portal / dados demonstrativos",
    "src/data/combinations.js": "/produto-1 / combinações",
    "src/data/archetypes.js": "/produto-1 / arquétipos",
    "src/data/reportVisualGuides.js": "/produto-1/relatorio / guia visual",
    "backend/app/data/quiz.py": "API Produto 1 / quiz",
    "backend/app/data/reports.json": "API Produto 1 / relatório base",
    "backend/app/services/pdf_service.py": "PDF Produto 1",
    "backend/app/services/mapa_vivo_service.py": "API Mapa Vivo",
    "backend/app/services/oraculo_service.py": "API Oráculo",
    "backend/app/services/produto2_service.py": "API Produto 2",
    "backend/app/services/produto2_calculo_service.py": "API Produto 2 / diagnósticos",
}


SKIP_PARTS = {
    "node_modules",
    "dist",
    "build",
    ".venv",
    "__pycache__",
}

SKIP_NAME_PATTERNS = (
    "ai_service",
    "_ai.",
    "_ai_",
    "method_ori_product1_ai",
    "method_ori_product2_ai",
    "admin_ai",
)

TECHNICAL_PATTERNS = (
    re.compile(r"^[A-Za-z0-9_./:@?&=%#-]+$"),
    re.compile(r"^(GET|POST|PUT|PATCH|DELETE)$"),
    re.compile(r"^(true|false|null|undefined)$", re.I),
    re.compile(r"^#[0-9a-fA-F]{3,8}$"),
    re.compile(r"^(var\(|url\(|rgba?\(|hsla?\(|linear-gradient|radial-gradient|calc\()"),
    re.compile(r"\.(png|jpg|jpeg|webp|svg|mp4|pdf|json|css|js|jsx)$", re.I),
    re.compile(r"^/api/"),
)

CLASSY_TOKENS = re.compile(
    r"(\bflex\b|\bgrid\b|\bpx-\d|\bpy-\d|\bmt-\d|\bmb-\d|\btext-\[|\bbg-\[|"
    r"\brounded|\bmax-w|\bmin-h|\bitems-|\bjustify-|\bgap-|\bori-type-|\bori-card|"
    r"rgba\(|gradient\(|\d+px\b|\d+px solid|inset 0|transparent \d|md:|lg:|hover:|disabled:|"
    r"\babsolute\b|\brelative\b|\binset-\d|\bpointer-events\b|\bopacity-\[|\bbackground\b|"
    r"\bborder\b|\bbox-shadow\b|\btransform\b|\btranslate\b|\bscale\b)"
)

CODE_TOKENS = re.compile(
    r"(\bconst\b|\blet\b|\breturn\b|\bBoolean\(|\bMath\.|\bJSON\.|\bnew Date\b|"
    r"\.map\(|\.filter\(|\.reduce\(|\.slice\(|\bfunction\b|=>|===|!==|&&|\|\|)"
)


@dataclass
class TextItem:
    area: str
    source: str
    line: int
    page: str
    kind: str
    text: str


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def should_skip(path: Path) -> bool:
    rel = relative(path)
    parts = set(path.parts)
    if parts & SKIP_PARTS:
        return True
    lowered = rel.lower()
    return any(pattern in lowered for pattern in SKIP_NAME_PATTERNS)


def looks_human_text(text: str) -> bool:
    clean = normalize(text)
    if not clean or len(clean) < 2:
        return False
    if CLASSY_TOKENS.search(clean):
        return False
    if CODE_TOKENS.search(clean):
        return False
    if clean.count(";") >= 2:
        return False
    if clean.count("{") or clean.count("=>"):
        return False
    if any(pattern.search(clean) for pattern in TECHNICAL_PATTERNS):
        return False
    letters = re.findall(r"[A-Za-zÀ-ÿ]", clean)
    if len(letters) < 2:
        return False
    if " " not in clean and len(clean) > 28:
        return False
    if re.search(r"[À-ÿ]", clean):
        return True
    if re.search(r"[.!?;,:]", clean) and len(clean) >= 8:
        return True
    if " " in clean and not re.search(r"[-_/{}\[\]<>]", clean):
        return True
    return clean in {
        "Entrar",
        "Sair",
        "Salvar",
        "Cancelar",
        "Continuar",
        "Voltar",
        "Publicar",
        "Editar",
        "Excluir",
        "Enviar",
        "Admin",
        "Cliente",
    }


def normalize(text: str) -> str:
    text = text.replace("\\n", "\n")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def line_for(source: str, index: int) -> int:
    return source.count("\n", 0, index) + 1


def page_for(path: Path) -> str:
    rel = relative(path)
    if rel.startswith("metodo-ori/"):
        rel = rel.removeprefix("metodo-ori/")
    return PAGE_BY_FILE.get(rel, PAGE_BY_FILE.get(relative(path), "Componente/serviço compartilhado"))


def area_for(path: Path, text: str) -> str:
    rel = relative(path)
    lowered = rel.lower()
    text_lower = text.lower()
    if (
        "admin" in lowered
        or "rascunho" in text_lower
        or "gerar com ia" in text_lower
        or "inteligência artificial" in text_lower
    ):
        return "Administração e controles internos"
    if "/data/reports" in lowered or "reports.json" in lowered or "pdf_service" in lowered:
        return "Relatórios e PDFs"
    if "/data/questions" in lowered or "quiz.py" in lowered:
        return "Quiz Produto 1"
    if "produto2" in lowered or "produto-2" in lowered:
        return "Produto 2"
    if "onboarding" in lowered:
        return "Onboarding"
    if "oraculo" in lowered:
        return "Oráculo"
    if "espelho" in lowered or "mapa_vivo" in lowered:
        return "Espelho ORI / Mapa Vivo"
    if "/pages/" in lowered:
        return "Páginas do app"
    return "Componentes compartilhados"


def add_item(items: list[TextItem], path: Path, line: int, kind: str, text: str) -> None:
    clean = normalize(text)
    if not looks_human_text(clean):
        return
    items.append(
        TextItem(
            area=area_for(path, clean),
            source=relative(path),
            line=line,
            page=page_for(path),
            kind=kind,
            text=clean,
        )
    )


def extract_js(path: Path) -> list[TextItem]:
    source = path.read_text(encoding="utf-8")
    items: list[TextItem] = []

    for match in re.finditer(r">([^<>{}][^<>{}]*[A-Za-zÀ-ÿ][^<>{}]*)<", source):
        add_item(items, path, line_for(source, match.start(1)), "JSX", match.group(1))

    for start, raw, quote in iter_js_strings(source):
        if quote == "`" and "${" in raw:
            for chunk in re.split(r"\$\{[^}]*\}", raw):
                add_item(items, path, line_for(source, start), "template", chunk)
        else:
            add_item(items, path, line_for(source, start), "string", raw)

    return items


def iter_js_strings(source: str):
    index = 0
    length = len(source)
    while index < length:
        quote = source[index]
        if quote not in {"'", '"', "`"}:
            index += 1
            continue
        start = index + 1
        index += 1
        escaped = False
        value: list[str] = []
        while index < length:
            char = source[index]
            if escaped:
                value.append(char)
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                yield start, "".join(value), quote
                index += 1
                break
            else:
                value.append(char)
            index += 1
        else:
            break


class PythonStringVisitor(ast.NodeVisitor):
    def __init__(self, path: Path) -> None:
        self.path = path
        self.items: list[TextItem] = []

    def visit_Constant(self, node: ast.Constant) -> None:
        if isinstance(node.value, str):
            add_item(self.items, self.path, getattr(node, "lineno", 1), "string", node.value)
        self.generic_visit(node)


def extract_py(path: Path) -> list[TextItem]:
    try:
        tree = ast.parse(path.read_text(encoding="utf-8"))
    except SyntaxError:
        return []
    visitor = PythonStringVisitor(path)
    visitor.visit(tree)
    return visitor.items


def walk_json(value, path: Path, items: list[TextItem], key_path: str = "") -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            if looks_human_text(str(key)):
                add_item(items, path, 1, f"json key {key_path}".strip(), str(key))
            walk_json(child, path, items, f"{key_path}.{key}" if key_path else str(key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            walk_json(child, path, items, f"{key_path}[{index}]")
    elif isinstance(value, str):
        add_item(items, path, 1, f"json {key_path}", value)


def extract_json(path: Path) -> list[TextItem]:
    items: list[TextItem] = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    walk_json(data, path, items)
    return items


def collect_items() -> list[TextItem]:
    roots = [
        FRONTEND / "src",
        BACKEND / "app" / "data",
        BACKEND / "app" / "services",
        BACKEND / "app" / "routes",
    ]
    items: list[TextItem] = []
    for root in roots:
        for path in root.rglob("*"):
            if not path.is_file() or should_skip(path):
                continue
            if path.suffix in {".js", ".jsx"}:
                items.extend(extract_js(path))
            elif path.suffix == ".py":
                items.extend(extract_py(path))
            elif path.suffix == ".json":
                items.extend(extract_json(path))

    seen: set[tuple[str, str, str]] = set()
    unique: list[TextItem] = []
    for item in items:
        key = (item.source, item.page, item.text)
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)
    return sorted(unique, key=lambda item: (item.area, item.page, item.source, item.line, item.text))


def build_pdf(items: list[TextItem]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="OriTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=colors.HexColor("#2A1711"),
            alignment=TA_LEFT,
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="OriH2",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#3A241B"),
            spaceBefore=12,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Meta",
            parent=styles["Normal"],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#6B5B51"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodySmall",
            parent=styles["Normal"],
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#1C1512"),
        )
    )

    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        leftMargin=1.4 * cm,
        rightMargin=1.4 * cm,
        topMargin=1.2 * cm,
        bottomMargin=1.2 * cm,
        title="Revisão de comunicação - textos do sistema",
        author="Método ORI",
    )

    def footer(canvas, document):
        canvas.saveState()
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(colors.HexColor("#7B6C63"))
        canvas.drawString(1.4 * cm, 0.65 * cm, "Método ORI · revisão de comunicação")
        canvas.drawRightString(19.6 * cm, 0.65 * cm, f"Página {document.page}")
        canvas.restoreState()

    story = [
        Paragraph("Textos do sistema para revisão de comunicação", styles["OriTitle"]),
        Paragraph(
            f"Gerado em {datetime.now().strftime('%d/%m/%Y %H:%M')}. "
            "Este documento reúne textos estáticos encontrados no frontend e no backend, "
            "excluindo guias, prompts e serviços de geração por IA. Textos fixos que apenas "
            "controlam funcionalidades de IA no admin foram mantidos em seção própria.",
            styles["BodySmall"],
        ),
        Spacer(1, 10),
        Paragraph(f"Total de trechos únicos encontrados: {len(items)}", styles["Meta"]),
        Spacer(1, 14),
    ]

    counts = defaultdict(int)
    for item in items:
        counts[item.area] += 1
    summary = [["Área", "Trechos"]]
    for area, count in sorted(counts.items()):
        summary.append([area, str(count)])
    table = Table(summary, colWidths=[13.5 * cm, 2.5 * cm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFE7DD")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#2A1711")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#D7C9BC")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    story.append(PageBreak())

    by_area: dict[str, list[TextItem]] = defaultdict(list)
    for item in items:
        by_area[item.area].append(item)

    for area in sorted(by_area):
        story.append(Paragraph(area, styles["OriH2"]))
        rows = [["Página/tela", "Origem", "Texto"]]
        for item in by_area[area]:
            rows.append(
                [
                    Paragraph(item.page, styles["Meta"]),
                    Paragraph(f"{item.source}:{item.line}", styles["Meta"]),
                    Paragraph(item.text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"), styles["BodySmall"]),
                ]
            )
        table = Table(rows, colWidths=[3.8 * cm, 4.2 * cm, 9.0 * cm], repeatRows=1)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#3A241B")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 8),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#DDD1C5")),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 5),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        story.append(table)
        story.append(PageBreak())

    doc.build(story, onFirstPage=footer, onLaterPages=footer)


def main() -> None:
    items = collect_items()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    JSON_PATH.write_text(
        json.dumps([asdict(item) for item in items], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    build_pdf(items)
    print(PDF_PATH)
    print(JSON_PATH)
    print(len(items))


if __name__ == "__main__":
    main()
