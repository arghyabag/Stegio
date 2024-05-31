let isImageUpload = false;
let securityKey = null;

// Loads input image to the Canvas for encoding or decoding
function loadImage(e) {
  let reader = new FileReader();
  reader.onload = (event) => {
    let regex = /data:image/;
    if (regex.test(reader.result)) {      //Checks if the uploaded file is an image 
      isImageUpload = true;
      let dataUrl = event.target.result;
      let img = new Image();
      img.onload = () => {
        let ctx = document.getElementById('canvas').getContext('2d');
        ctx.canvas.width = img.width;
        ctx.canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      }
      img.src = dataUrl;
    } else {
      document.getElementById('upload-photo').value = '';
      alert("Please upload an image!");
    }
  };
  reader.readAsDataURL(e.target.files[0]);
};

// Prompt user to enter security key for encoding
function enterSecurityKeyForEncoding() {
  securityKey = prompt("Enter security key for encoding:");
}

// Prompt user to enter security key for decoding
function enterSecurityKeyForDecoding() {
  securityKey = prompt("Enter security key for decoding:");
}

// Encodes the secret message on the original and displays the encoded image
function encode() {
  enterSecurityKeyForEncoding(); // Prompt user for security key

  if (isImageUpload) {      //Checks if an image is uploaded  
    let message = document.getElementById('secret').value;
    if (message.length > 1000) {
      alert("The message is too big to encode");
    } else {
      document.getElementById('encoded-image').style.display = 'block';
      document.getElementById('secret').value = '';
      let output = document.getElementById('encoded-image');
      let canvas = document.getElementById('canvas');
      let ctx = canvas.getContext('2d');
      let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      encodeMessage(imgData.data, message, securityKey); // Pass security key to encodeMessage
      ctx.putImageData(imgData, 0, 0);
      alert('Image encoded!\n Save below image for further use!');
      output.src = canvas.toDataURL();
    }
  } else {
    document.getElementById('upload-photo').value = '';
    alert("Please upload an image!");
  }
};

// Decodes the secret message from the canvas and alerts it to the user
function decode() {
  enterSecurityKeyForDecoding(); // Prompt user for security key

  if (securityKey === null) {
    alert("Please provide a security key for decoding.");
    return;
  }

  let ctx = document.getElementById('canvas').getContext('2d');
  let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  let message = decodeMessage(imgData.data, securityKey); // Pass security key to decodeMessage
  if (message === null) {
    alert("Invalid security key or no message found. Unable to decode.");
    return;
  }
  alert("The decoded message is:\n" + message);
};

// Encodes message using LSB method
function encodeMessage(colors, message, key) {
  let messageBits = getBitsFromNumber(message.length);
  messageBits = messageBits.concat(getMessageBits(message));
  let history = [];
  let pos = 0;
  while (pos < messageBits.length) {
    let loc = getNextLocation(history, colors.length);
    colors[loc] = setBit(colors[loc], 0, messageBits[pos]);
    while ((loc + 1) % 4 !== 0) {
      loc++;
    }
    colors[loc] = 255;
    pos++;
  }
};

// Converts a string message into an array of bits representing the message in 2-byte character codes

function getMessageBits(message) {
  let messageBits = [];

  // Iterate through each character in the message
  for (let i = 0; i < message.length; i++) {
    // Get the character code for the current character
    let code = message.charCodeAt(i);

    // Convert the character code into an array of bits
    let bits = getBitsFromNumber(code);

    // Append the bits to the messageBits array
    messageBits = messageBits.concat(bits);
  }

  return messageBits;
}


// Decodes message from the image
function decodeMessage(colors, key) {
  let history = [];
  let decodedMessage = '';

  // Step 1: Retrieve and decrypt message size
  let encryptedMessageSize = getNumberFromBits(colors, history);
  let messageSize = decryptNumber(encryptedMessageSize, key);

  // Step 2: Validate message size
  if ((messageSize + 1) * 16 > colors.length * 0.75 || messageSize <= 0) {
    return ''; // Invalid size or too large
  }

  // Step 3: Retrieve and decrypt each character in the message
  for (let i = 0; i < messageSize; i++) {
    let encryptedCode = getNumberFromBits(colors, history);
    let code = decryptNumber(encryptedCode, key);
    decodedMessage += String.fromCharCode(code);
  }

  return decodedMessage; // Return the decoded message
}

// Decrypt a 2-byte number using the security key
function decryptNumber(encryptedNumber, key) {
  // Use a PRNG seeded with the key to generate a pseudo-random sequence for decryption
  let prng = new PRNG(key);
  let mask = prng.next() & 0xFFFF; // Generate a 16-bit mask
  return encryptedNumber ^ mask;
}

// A simple PRNG implementation (e.g., a linear congruential generator)
class PRNG {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    // Linear congruential generator parameters
    const a = 1664525;
    const c = 1013904223;
    this.seed = (a * this.seed + c) % 0x100000000;
    return this.seed;
  }
}

function getBit(number, location) {
  return ((number >> location) & 1);
}

function setBit(number, location, bit) {
  return (number & ~(1 << location)) | (bit << location);
}

function getBitsFromNumber(number) {
  let bits = [];
  for (let i = 0; i < 16; i++) {
    bits.push(getBit(number, i));
  }
  return bits;
}

function getNumberFromBits(bytes, history) {
  let number = 0, pos = 0;
  while (pos < 16) {
    let loc = getNextLocation(history, bytes.length);
    let bit = getBit(bytes[loc], 0);
    number = setBit(number, pos, bit);
    pos++;
  }
  return number;
}

function getNextLocation(history, total) {
  let loc = 0;
  while (true) {
    if (history.indexOf(loc) >= 0) {
      loc++;
    } else if ((loc + 1) % 4 === 0) {
      loc++;
    } else {
      history.push(loc);
      return loc;
    }
  }
}

export { decode, encode, loadImage };
