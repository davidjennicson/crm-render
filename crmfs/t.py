import pikepdf

input_pdf = "pan card.pdf"
output_pdf = "davidjennicsonpancard.pdf"
password = "13102001"

with pikepdf.open(input_pdf, password=password) as pdf:
    pdf.save(output_pdf)

print("Password removed successfully.")