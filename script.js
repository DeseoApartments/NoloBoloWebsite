document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('fade-in');
    
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            answer.style.display = (answer.style.display === 'block') ? 'none' : 'block';
        });
    });

    const quantities = document.querySelectorAll('.quantity');
    quantities.forEach(input => {
        input.addEventListener('input', updateCart);
    });

    initAutocomplete();

    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value');
            const allStars = star.parentNode.querySelectorAll('.star');
            allStars.forEach(s => s.classList.remove('selected'));
            for (let i = 0; i < value; i++) {
                allStars[i].classList.add('selected');
            }
        });
    });
});

function scrollToAdditionalInfo() {
    document.getElementById('additional-info').scrollIntoView({ behavior: 'smooth' });
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    let total = 0;

    const quantities = document.querySelectorAll('.quantity');
    quantities.forEach(input => {
        const item = input.getAttribute('data-item');
        const price = parseFloat(input.getAttribute('data-price'));
        const quantity = parseInt(input.value);

        if (quantity > 0) {
            const itemTotal = price * quantity;
            total += itemTotal;

            const li = document.createElement('li');
            li.textContent = `${item} x ${quantity} = €${itemTotal.toFixed(2)}`;
            cartItems.appendChild(li);
        }
    });

    document.getElementById('order-total').textContent = `Totale: €${total.toFixed(2)}`;
}

function initAutocomplete() {
    const addressInputs = document.querySelectorAll('input[id^="address"]');
    addressInputs.forEach(input => {
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                input.value = '';
            }
        });
    });
}

function calculateQuote(event) {
    event.preventDefault();
    
    const singleBeds = parseInt(document.getElementById('single-beds').value);
    const doubleBeds = parseInt(document.getElementById('double-beds').value);
    const bathrooms = parseInt(document.getElementById('bathrooms').value);
    const apartments = parseInt(document.getElementById('apartments').value);
    const weeklyChanges = 1;
    
    const prices = {
        "Lenzuolo matrimoniale": 7,
        "Copripiumino matrimoniale": 10,
        "Lenzuolo singolo": 6,
        "Copripiumino singolo": 8.50,
        "Federa": 1.50,
        "Asciugamano Telo Doccia": 4,
        "Asciugamano Viso": 2.5,
        "Asciugamano Ospiti": 1.5,
        "Scendibagno (Tappetino)": 3.5,
        "Canovaccio": 2
    };
    
    const quantities = {
        "Lenzuolo matrimoniale": doubleBeds * weeklyChanges * 4,
        "Copripiumino matrimoniale": doubleBeds * weeklyChanges * 4,
        "Lenzuolo singolo": singleBeds * weeklyChanges * 4,
        "Copripiumino singolo": singleBeds * weeklyChanges * 4,
        "Federa": (singleBeds + doubleBeds * 2) * weeklyChanges * 4,
        "Asciugamano Telo Doccia": bathrooms * weeklyChanges * 4,
        "Asciugamano Viso": bathrooms * weeklyChanges * 4,
        "Asciugamano Ospiti": bathrooms * weeklyChanges * 4,
        "Scendibagno (Tappetino)": bathrooms * weeklyChanges * 4,
        "Canovaccio": apartments * weeklyChanges * 4
    };
    
    let total = 0;
    for (let item in quantities) {
        total += quantities[item] * prices[item];
    }
    
    let result = `<h3>Preventivo Mensile (Unità che consegneremo la prima volta)</h3><ul>`;
    for (let item in quantities) {
        result += `<li>${item}: ${quantities[item]} unità</li>`;
    }
    result += `</ul><p>Totale: €${total.toFixed(2)} (IVA inclusa e consegna gratuita)</p>`;
    
    document.getElementById('quote-result').innerHTML = result;
    document.getElementById('confirm-quote-button').style.display = 'block';

    // Salva i dettagli del preventivo
    document.getElementById('quote-details').value = JSON.stringify({
        quantities: quantities,
        total: total.toFixed(2)
    });
}

function showOrderForm() {
    document.getElementById('order-form-section').style.display = 'block';
    document.getElementById('order-form-section').scrollIntoView({ behavior: 'smooth' });
}

function submitOrder(event) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Disabilita il pulsante
    
    const fullName = document.getElementById('full-name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const quoteDetails = JSON.parse(document.getElementById('quote-details').value);
    
    let orderDetails = {
        fullName,
        phone,
        email,
        orderDetails: '',
        totalPrice: quoteDetails.total
    };

    // Aggiungi le quantità di biancheria all'ordine
    for (let item in quoteDetails.quantities) {
        orderDetails.orderDetails += `${item}: ${quoteDetails.quantities[item]} unità\n`;
    }

    console.log(orderDetails); // Log per debug

    emailjs.send('service_t1rib3a', 'template_prc6spa', orderDetails)
        .then((response) => {
            console.log('SUCCESS!', response.status, response.text); // Log per debug
            alert('Congratulazioni!\nIl tuo ordine è stato preso in carico. A breve riceverai una mail con tutte le informazioni necessarie per procedere al pagamento.');
            submitButton.disabled = false; // Abilita il pulsante
            resetForms(); // Azzera i campi del form
            window.location.href = '#home'; // Reindirizza alla pagina principale
        }, (error) => {
            console.log('FAILED...', error); // Log per debug
            alert('Errore nell\'invio dell\'ordine.');
            submitButton.disabled = false; // Abilita il pulsante
        });
}

function resetForms() {
    document.getElementById('quote-form').reset();
    document.getElementById('order-form').reset();
    document.getElementById('quote-result').innerHTML = '';
    document.getElementById('confirm-quote-button').style.display = 'none';
}

function submitContactForm(event) {
    event.preventDefault();

    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Disabilita il pulsante

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    
    const contactDetails = {
        name,
        email,
        phone,
        message
    };
    
    console.log(contactDetails); // Log for debugging
    
    emailjs.send('service_t1rib3a', 'template_prc6spa', contactDetails)
    .then((response) => {
        console.log('SUCCESS!', response.status, response.text); // Log for debugging
        alert('Richiesta inviata con successo!');
        submitButton.disabled = false; // Abilita il pulsante
    }, (error) => {
        console.log('FAILED...', error); // Log for debugging
        alert('Errore nell\'invio della richiesta.');
        submitButton.disabled = false; // Abilita il pulsante
    });
}
