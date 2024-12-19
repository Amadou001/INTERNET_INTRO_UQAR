$(document).ready(function () {
    // recupère les donnée sauvegarder dans la navigateur
    const userName = localStorage.getItem('username');
    const finalScore = localStorage.getItem('score');
    const results = JSON.parse(localStorage.getItem('quizResults'));

    // Affiche le score
    $('#userName').text(userName || 'Utilisateur');
    $('#finalScore').text(finalScore || 0);

    // Mettre les donnée dans le tableau
    const resultsTable = $('#resultsTable');
    results.forEach((result, index) => {
        const resultRow = `
            <tr>
                <td>${index + 1}</td>
                <td><img src="http://localhost:81/data/${result.question}" alt="Image ${result.question}" style="max-height: 100px;"></td>
                <td>${result.userCategory || 'Non choisi'}</td>
                <td>${result.correctCategory}</td>
                <td>${result.userDescription || 'Non choisi'}</td>
                <td>${result.correctDescription}</td>
                <td>${result.score_par_q}</td>
                <td>${result.isCorrectCategory && result.isCorrectDescription ? '✔️ Correct' : '❌ Incorrect'}</td>
            </tr>
        `;
        resultsTable.append(resultRow);
    });

    $("a").attr('href', `quiz.html?username=${userName}`);
});
