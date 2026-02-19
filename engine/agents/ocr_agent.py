import fitz  # PyMuPDF: run `pip install pymupdf`
from langchain_core.output_parsers import JsonOutputParser

from core.llm_setup import get_llm
from core.prompts import get_ocr_prompt
from schemas.agent_models import ExtractedDocumentDTO

def run_ocr_extraction(file_bytes: bytes, filename: str):
    text = ""
    if filename.lower().endswith('.pdf'):
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
    else:
        text = "Image OCR not fully implemented. Please upload PDFs."

    llm = get_llm()
    prompt = get_ocr_prompt()
    parser = JsonOutputParser(pydantic_object=ExtractedDocumentDTO)

    chain = prompt | llm | parser

    try:
        result = chain.invoke({
            "text": text,
            "format_instructions": parser.get_format_instructions()
        })
        return result
    except Exception as e:
        return {
            "vendor_name": "UNKNOWN",
            "invoice_number": "UNKNOWN",
            "date": "UNKNOWN",
            "subtotal": 0.0,
            "tax_amount": 0.0,
            "total_amount": 0.0,
            "line_items": [],
            "error": str(e)
        }