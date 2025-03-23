const { jsPDF } = window.jspdf;
        const previewContainer = document.getElementById("preview");
        const fileInput = document.getElementById("imageInput");
        let selectedOrientation = null; // No default selection
        let selectedMargin = "none"; // Default margin is "none"
        let filesList = []; // Array to store selected files

        // Handle Image Preview
        fileInput.addEventListener("change", function () {
            const newFiles = Array.from(this.files);
            filesList = [...filesList, ...newFiles]; // Append new files to the existing list

            previewContainer.innerHTML = ""; // Clear the preview container
            filesList.forEach(file => {
                let img = document.createElement("img");
                img.classList.add("preview-img");
                img.src = URL.createObjectURL(file);
                previewContainer.appendChild(img);
            });
        });

        // Handle Orientation Selection
        function setOrientation(type) {
            selectedOrientation = type;
            document.getElementById("portraitBtn").classList.remove("active");
            document.getElementById("landscapeBtn").classList.remove("active");
            document.getElementById(type + "Btn").classList.add("active");
        }

        // Handle Margin Selection
        function setMargin(type) {
            selectedMargin = type;
            document.getElementById("noMarginBtn").classList.remove("active");
            document.getElementById("smallMarginBtn").classList.remove("active");
            document.getElementById("bigMarginBtn").classList.remove("active");
            document.getElementById(type + "MarginBtn").classList.add("active");
        }

        function convertToPDF() {
            if (filesList.length === 0) {
                alert("⚠️ Please select images first.");
                return;
            }

            if (!selectedOrientation) {
                alert("⚠️ Please select an orientation.");
                return;
            }

            let pdf = new jsPDF({ orientation: selectedOrientation });

            // Define margins based on selection
            let margin;
            switch (selectedMargin) {
                case "none":
                    margin = 0;
                    break;
                case "small":
                    margin = 15;
                    break;
                case "big":
                    margin = 30;
                    break;
                default:
                    margin = 0; // Default to no margin
            }

            let promises = [];
            filesList.forEach((file, index) => {
                let img = new Image();
                img.src = URL.createObjectURL(file);

                let promise = new Promise((resolve) => {
                    img.onload = function () {
                        let pageWidth = pdf.internal.pageSize.getWidth();
                        let pageHeight = pdf.internal.pageSize.getHeight();

                        // Calculate image dimensions with margins
                        let imgWidth = pageWidth - 2 * margin;
                        let imgHeight = (img.height / img.width) * imgWidth;

                        // Center the image
                        let x = margin;
                        let y = (pageHeight - imgHeight) / 2;

                        if (index !== 0) pdf.addPage();
                        pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
                        resolve();
                    };
                });

                promises.push(promise);
            });

            Promise.all(promises).then(() => {
                pdf.save("converted.pdf");

                // Reset selections
                fileInput.value = ""; // Clear file input
                filesList = []; // Clear the files list
                previewContainer.innerHTML = ""; // Clear image preview
                selectedOrientation = null; // Reset orientation
                selectedMargin = "none"; // Reset margin to "none"

                // Unselect all radio and margin buttons
                document.getElementById("portraitBtn").classList.remove("active");
                document.getElementById("landscapeBtn").classList.remove("active");
                document.getElementById("noMarginBtn").classList.remove("active");
                document.getElementById("smallMarginBtn").classList.remove("active");
                document.getElementById("bigMarginBtn").classList.remove("active");
                document.getElementById("noMarginBtn").classList.add("active"); // Set default margin to "none"
            });
        }

        // Set default margin to "none" on page load
        document.getElementById("noMarginBtn").classList.add("active");