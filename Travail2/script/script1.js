$(document).ready(function () {

    const params = new URLSearchParams(window.location.search);
        const userName = params.get('username');
        $('#userName').text(userName);

        let images = [];
        let descriptions = {};
        let categories = {};
        let correctAnswers = 0;
        let currentQuestionIndex = 0;
        let userAnswers = [];

        // Récupérer les données depuis le serveur
        Promise.all([
            $.get('http://localhost:81/data.php/?data=images'),
            $.get('http://localhost:81/data.php/?data=propositions'),
            $.get('http://localhost:81/data.php/?data=categories')
        ]).then(([imagesResponse, propositionsResponse, categoriesResponse]) => {
            images = imagesResponse.images;
            descriptions = propositionsResponse.propositions;
            categories = categoriesResponse.categories;

            // Selectionne 10 images aléatoire
            images = selectRandomImages(images, 10);
            
            loadNextQuestion();
        });

        function loadNextQuestion() {
            if (currentQuestionIndex >= images.length) {
                redirectToResultPage();
                return;
            }

            const imageName = images[currentQuestionIndex];
            const imageUrl = `http://localhost:81/data/${imageName}`;

            // Recupère la correcte catégory et description de chaque image
            $.get(`http://localhost:81/data.php/?data=response&image=${imageName}`).then((response) => {
                if (response && response["description"]) {
                    const correctDescription = response["description"];
                    const correctCategory = response["category"];

                    // Choisi aléatoirement 3  fausses description (from a shuffled list)
                    let incorrectDescriptions = Object.values(descriptions).filter((desc, index) => index !== images.indexOf(imageName));
                    incorrectDescriptions = shuffle(incorrectDescriptions).slice(0, 3);

                    // Combine la bonne description aux mauvaise
                    let allDescriptions = [...incorrectDescriptions];
                    allDescriptions.push(correctDescription);

                    const shuffledDescriptions = shuffle(allDescriptions);

                    // Affichage de l'image
                    $('#quizImage').attr('src', imageUrl);

                    // Générer les boutons radio pour la catégorie
                    $('#categorieOptions').html(`
                        <form>
                        <fieldset>
                        <legend id="main">Categorie</legend>
                        ${Object.values(categories).map((cat, index) => `
                            <input type="radio" name="category" value="${cat}" id="cat${index + 1}">
                            <label for="cat${index + 1}">${cat}</label><br>
                        `).join('')}
                        </fieldset>
                        </form>
                    `);

                    // Générer les boutons radio pour la description
                    $('#descriptionOptions').html(`
                        <form>
                        <fieldset>
                        <legend id="main">Description</legend>
                        ${shuffledDescriptions.map((prop, index) => `
                            <input type="radio" name="description" value="${prop}" id="desc${index + 1}">
                            <label for="desc${index + 1}">${prop}</label><br>
                        `).join('')}
                        </fieldset>
                        </form>
                    `);

                    // Attach event listener for next button
                    $('#nextButton').off('click').on('click', function () {
                        const selectedCategory = $('input[name="category"]:checked').val();
                        const selectedDescription = $('input[name="description"]:checked').val();
                        let score_par_q = 0;
                        let isCorrectCategory = false;
                        let isCorrectDescription = false;
                        // vérification des réponses
                        if (selectedCategory && selectedDescription) {
                            if (selectedDescription === correctDescription) {
                                isCorrectDescription = true;
                                correctAnswers += 0.5;
                                score_par_q += 0.5;
                            }
                            if (selectedCategory === correctCategory) {
                                isCorrectCategory = true;
                                correctAnswers += 0.5;
                                score_par_q += 0.5;
                            }

                        }
                        // Enregistrement des réponses pour cette question
                        userAnswers.push({
                            question: imageName,
                            userCategory: selectedCategory,
                            userDescription: selectedDescription,
                            correctCategory: correctCategory,
                            correctDescription: correctDescription,
                            isCorrectCategory: isCorrectCategory,
                            isCorrectDescription: isCorrectDescription,
                            score_par_q: score_par_q
                        });
                        currentQuestionIndex++;
                        loadNextQuestion();
                    });
                }
            });
        }

        function redirectToResultPage() {
            // Sauvegarde les résultats dans localStorage
            localStorage.setItem('quizResults', JSON.stringify(userAnswers));
            localStorage.setItem('username', userName);
            localStorage.setItem('score', correctAnswers);

            // Redirection à la page resultat
            window.location.href = 'result.html';
        }

        // Fonction pour mélanger aléatoirement les list
        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // function pour choisir aléatoirement les 10 images
        function selectRandomImages(imagesArray, numberOfImages) {
            let shuffledImages = shuffle(imagesArray);
            return shuffledImages.slice(0, numberOfImages);
        }

});
