
document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.querySelector(".lang-dropdown");
    const selected = document.querySelector(".lang-selected");
    const options = document.querySelectorAll(".lang-option");

    // Toggle dropdown visibility
    selected.addEventListener("click", () => {
        dropdown.classList.toggle("open");
    });

    // Handle language selection
    options.forEach(option => {
        option.addEventListener("click", () => {
            const value = option.getAttribute("data-value");
            const flag = option.querySelector("span").outerHTML;
            const text = option.textContent.trim();

            // Update the selected button
            selected.innerHTML = `${flag} ${text}`;

            // Close the dropdown
            dropdown.classList.remove("open");

            // Add any additional logic for language switching here
            console.log(`Selected language: ${value}`);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove("open");
        }
    });
});
