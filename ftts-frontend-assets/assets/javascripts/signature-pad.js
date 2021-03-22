const canvas = document.querySelector('canvas')

const signatureContainer = document.getElementById('signature-container').clientWidth
console.log(signatureContainer)
canvas.setAttribute('width', signatureContainer)

const signaturePad = new SignaturePad(canvas, { // eslint-disable-line
  backgroundColor: 'rgba(220, 220, 220, 1 )',
  penColor: 'rgb(0, 0, 0)'
})

let clearButton = document.getElementById('clear')

clearButton.addEventListener('click', function (event) {
  signaturePad.clear()
})
