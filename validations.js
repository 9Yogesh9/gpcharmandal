document.addEventListener("DOMContentLoaded", () => {
  // Generic input validation function
  function validateInput(inputElement, validator) {
    inputElement.addEventListener("input", () => {
      const value = inputElement.value.trim();
      const isValid = validator(value);

      inputElement.classList.toggle("is-valid", isValid);
      inputElement.classList.toggle("is-invalid", !isValid);
    });
  }

  // Name validation
  const nameInput = document.getElementById("user_name");
  validateInput(nameInput, (value) =>
    /^[\p{L}]{2,}(?: [\p{L}]+)*$/u.test(value)
  );

  // Mobile number validation (10 digits)
  const mobileInputs = [
    document.getElementById("mobile_number"),
    document.getElementById("mobile_search"),
  ];
  mobileInputs.forEach((input) => {
    validateInput(input, (value) => value.length === 10);
  });

  // Unique ID validation (13 characters)
  const idSearchInput = document.getElementById("id_search");
  validateInput(idSearchInput, (value) => value.length === 13);
});
