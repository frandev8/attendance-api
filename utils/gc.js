function generateRand5Digit() {
  // Generate a random number between 10000 and 99999 (inclusive)
  const randomNumber = Math.floor(Math.random() * 90000) + 10000;

  // Ensure the number has exactly 5 digits (prevent leading zeros)
  const formattedNumber = randomNumber.toString().padStart(5, "0");

  return formattedNumber;
}

module.exports = { generateRand5Digit };
