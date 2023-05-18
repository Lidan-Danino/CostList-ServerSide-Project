/*Developers Details:
 * Lidan Danino - 207599473
 * Niv Netanel - 208540302
 */
// Define the function developersDetails
function developersDetails() {
  // Define an array of developer objects
  const developers = [
    {
      firstName: "Lidan",
      lastName: "Danino",
      id: "207599473",
      email: "lidan05463@gmail.com",
    },
    {
      firstName: "Niv",
      lastName: "Netanel",
      id: "208540302",
      email: "nivnetanel@gmail.com",
    },
  ];

  // Return the JSON string representation of the developers array
  return JSON.stringify(developers);
}

// Export the developersDetails function as a property of the module exports object
module.exports.developersDetails = developersDetails;
