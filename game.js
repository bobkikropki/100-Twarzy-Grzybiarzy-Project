const quizData = {
    'CS2': [
        { 
            img: 'images/game/cs2/usp1.png', 
            q: 'Ile trwa animacja ściągania tłumika z USP?', 
            a: ['2s', '4s', '5s', '6s'], 
            correct: 1
},
        { 
            img: 'images/game/cs2/awp1.jpg', 
            q: 'Ile zapłacisz za AWP w CS?', 
            a: ['4500$', '3750$', '4750$', '5000$'], 
            correct: 2
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Jak nazywa się mapa widoczna na zdjęciu?', 
            a: ['Office', 'Militia', 'Italy', 'Assault'], 
            correct: 0
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Na której z map znajduję się pomnik rycerza z oszczepem?', 
            a: ['Cobblestone', 'Mirage', 'Overpass', 'Nuke'], 
            correct: 0
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Ile jest domyślnych trybów (sugerowanych przez valve) w CS2?', 
            a: ['6', '5', '8', '7'], 
            correct: 3
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Którą broń najszybciej przeładujesz w CS2?', 
            a: ['P250', 'AK-47', 'AWP', 'MAG-7'], 
            correct: 0
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Która z operacji wyszła w 2015 roku?', 
            a: ['Bravo', 'Vanguard', 'Breakout', 'Bloodhunt'], 
            correct: 3
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Która z operacji wyszła w 2015 roku?', 
            a: ['Bravo', 'Vanguard', 'Breakout', 'Bloodhunt'], 
            correct: 3
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Ile kosztuje Nova w CS2?', 
            a: ['1500$', '1200$', '1050$', '900$'], 
            correct: 2
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Counter-strike był oryginalnie modyfikacją do:', 
            a: ['Unreal Tournament', 'Call of Duty', 'Half-life', 'Quake 3 Arena'], 
            correct: 2
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Który z wymienionych niżej karabinów ma najmniej efektywny zasięg?', 
            a: ['Galil AR', 'Famas', 'M4A1-S', 'AK-47'], 
            correct: 1
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Ile wynosi maksymalna nagroda pieniężna, jaką gracz może otrzymać za zabójstwo nożem w trybie Turniejowym?', 
            a: ['3000$', '1200$', '900$', '1500$'], 
            correct: 3
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Jak długo utrzymuje się granat dymny w CS2?', 
            a: ['12 sekund', '18 sekund', '15 sekund', '20 sekund'], 
            correct: 1
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Ile wynosi nagroda za zabójstwo przy użyciu CZ75-Auto?', 
            a: ['100$', '0$', '600$', '300$'], 
            correct: 0
},
        { 
            img: 'images/game/cs2/office.jpg', 
            q: 'Ile wynosi czas do wybuchu bomby od momentu jej podłożenia?', 
            a: ['35 sekund', '40 sekund', '45 sekund', '30 sekund'], 
            correct: 1
},
        { 
            img: 'images/game/cs2/jungle.png', 
            q: 'Jak nazywa się ta pozycja?', 
            a: ['Okno', 'Długa', 'Dżungla', 'Edward'], 
            correct: 2
},
        { 
            img: 'images/game/cs2/lawka.png', 
            q: 'Jak nazywa się ta pozycja?', 
            a: ['Mid', 'Ławka', 'Dżungla', 'Ninja'], 
            correct: 1
},
        { 
            img: 'images/game/cs2/okno.png', 
            q: 'Jak nazywa się ta pozycja?', 
            a: ['Mid', 'Firebox', 'Kanapka', 'Okno'], 
            correct: 3
},
        { 
            img: 'images/game/cs2/dolny.png', 
            q: 'Jak nazywa się ta pozycja?', 
            a: ['Anarchia', 'Dolny', 'Suicide', 'Samochód'], 
            correct: 1
},
        { 
            img: 'images/game/cs2/suicide.png', 
            q: 'Jak nazywa się ta pozycja?', 
            a: ['Piach', 'Górny', 'Suicide', 'Bombsite A'], 
            correct: 2
},
        { 
            img: 'images/game/cs2/suicide.png', 
            q: 'Jak nazywa się ta pozycja?', 
            a: ['Piach', 'Gala', 'Bombsite B', 'Goose'], 
            correct: 0
},
    ],
    'Wiedźmin': [
        { img: '', q: 'Z jakiej szkoły pochodzi Geralt?', a: ['Kota', 'Gryfa', 'Wilka', 'Niedźwiedzia'], correct: 2 },
        { img: '', q: 'Jak nazywa się ta twierdza?', a: ['Wyzima', 'Kaer Morhen', 'Novigrad', 'Skellige'], correct: 1 },
        
    ],
    'Isaac': [
        { img: '', q: 'Co to za item?', a: ['Kota', 'Gryfa', 'Wilka', 'Niedźwiedzia'], correct: 2 },
        { img: '', q: 'Jak nazywa się ta twierdza?', a: ['Wyzima', 'Kaer Morhen', 'Novigrad', 'Skellige'], correct: 1 },
        
    ]
};

let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

function selectCategory(category) {
    // pobierania pytania dla gry wybranej
    const allCategoryQuestions = quizData[category]; 
    
    // losuje 10 pytań z danej kategorii
    currentQuestions = allCategoryQuestions 
        .sort(() => 0.5 - Math.random()) 
        .slice(0, 10);

    // resetuje stan gry
    currentQuestionIndex = 0;
    score = 0;
    updateStats();

    // przelaczenie ekranuf
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('quiz-active').style.display = 'block';

    showQuestion();
}

function showQuestion() {
    const q = currentQuestions[currentQuestionIndex];
    document.getElementById('q-img').src = q.img;
    document.getElementById('q-text').innerText = q.q;

    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach((btn, index) => {
        btn.innerText = q.a[index];
        btn.style.backgroundColor = '#3d4450'; 
        btn.disabled = false;
    });
}

function handleAnswer(selectedIndex) {
    const correctIndex = currentQuestions[currentQuestionIndex].correct;
    const buttons = document.querySelectorAll('.answer-btn');

    
    buttons.forEach(btn => btn.disabled = true);

    if (selectedIndex === correctIndex) {
        score++;
        buttons[selectedIndex].style.backgroundColor = '#2ecc71'; 
    } else {
        buttons[selectedIndex].style.backgroundColor = '#e74c3c'; 
        buttons[correctIndex].style.backgroundColor = '#2ecc71'; 
    }


    setTimeout(() => {
        currentQuestionIndex++;
        updateStats();

        if (currentQuestionIndex < 10) {
            showQuestion();
        } else {
            showResults();
        }
    }, 1000);
}

function updateStats() {
    document.getElementById('current-points').innerText = score;
    document.getElementById('question-counter').innerText = `${currentQuestionIndex}/10`;
}

function showResults() {
    document.getElementById('quiz-active').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('final-score').innerText = score;
}