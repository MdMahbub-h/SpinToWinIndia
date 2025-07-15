/* ----------------------------------- Password visibility toggle */

function togglePassRegEmail(button, id) {
    const passRegEmailInput = document.getElementById(id);

    if (passRegEmailInput.type === "password") {
        passRegEmailInput.type = "text";
        button.classList.add('show');
        button.classList.remove('hide');
    } else {
        passRegEmailInput.type = "password";
        button.classList.add('hide');
        button.classList.remove('show');
    }
}

$(document).ready(function() {

    /* -------------------------------- Form validation */

    function validateForm(context) {
        const phone = $(`${context} input[name="phone"]`).val().trim();
        const email = $(`${context} input[name="email"]`).val().trim();
        const password = $(`${context} input[name="password"]`).val().trim();

        $(`${context} .phone, ${context} .email, ${context} .pass-block`).removeClass('error');

        let isValid = true;

        if (phone === '') {
            $(`${context} .phone`).addClass('error');
            isValid = false;
        }
        if (email === '') {
            $(`${context} .email`).addClass('error');
            isValid = false;
        }
        if (password === '') {
            $(`${context} .pass-block`).addClass('error');
            isValid = false;
        }

        if (isValid) {
            window.location.href = "https://4rabet-play.com/";
        }
    }

    $("#sign-up-btn-modal").click(function(event) {
        event.preventDefault();
        validateForm('.modal');
    });

    /* -------------------------------- Lights on the wheel */

    const container = $('#lights');
    const circleCount = 24;
    const paddingVW = 4;

    function updateCircles() {
        const containerWidth = container.width();
        const containerHeight = container.height();
        const padding = (Math.min(containerWidth, containerHeight) * paddingVW) / 100;
        const radius = (Math.min(containerWidth, containerHeight) / 2) - padding;

        const centerX = 50;
        const centerY = 50;

        const circleDiameter = radius / 17;

        container.find('.circle').remove();

        for (let i = 0; i < circleCount; i++) {
            const angle = (2 * Math.PI * i) / circleCount;
            const xPercent = centerX + (radius / containerWidth) * 100 * Math.cos(angle) - (circleDiameter / containerWidth) * 100 / 2;
            const yPercent = centerY + (radius / containerHeight) * 100 * Math.sin(angle) - (circleDiameter / containerHeight) * 100 / 2;

            const circle = $('<div></div>')
            .addClass('circle')
            .css({
                left: `${xPercent}%`,
                top: `${yPercent}%`,
                width: `${circleDiameter}px`,
                height: `${circleDiameter}px`,
            });
            container.append(circle);
        }
    }

    function colorCircles() {
        $('.circle').css('background-color', 'rgba(255, 255, 255, .2)'); // Скидаємо всі кола до сірого

        const randomIndices = new Set();
        while (randomIndices.size < 5) {
            const candidate = Math.floor(Math.random() * circleCount);
            const isValid = [...randomIndices].every(index => 
                Math.abs(candidate - index) >= 3 && 
                Math.abs(candidate - index) <= circleCount - 3
            );
            if (isValid) {
                randomIndices.add(candidate);
            }
        }

        randomIndices.forEach(index => {
            $('.circle').eq(index).css('background-color', 'white');
        });
    }

    setInterval(colorCircles, 500);

    $(window).resize(function() {
        updateCircles();
    });

    updateCircles();

    /* -------------------------------- Spin wheel animation */

    document.getElementById('spinBtn').addEventListener('click', function() {
        const wheel = document.getElementById('wheel');
        const spinBtn = document.getElementById('spinBtn');
        
        spinBtn.disabled = true;
    
        let rotations = 5; 
        let spinDuration = 6000; 
        
        wheel.style.transition = `transform ${spinDuration}ms ease-in-out`;
        wheel.style.transform = `rotate(${rotations * 360 + 270}deg)`; 

        $('#left').text(1);

        setTimeout(() => {
            setTimeout(() => {
                clearInterval(timerInterval);
            }, 500);
        }, spinDuration);
    
        setTimeout(() => {
            spinBtn.disabled = false;
        }, spinDuration);
    
        setTimeout(() => {
            spinBtn.id = 'spinBtn2';
            document.getElementById('spinBtn2').addEventListener('click', function() {
                const spinBtn2 = document.getElementById('spinBtn2');
                spinBtn2.disabled = true;
    
                let rotations2 = 12; 
                let spinDuration2 = 6000; 
                
                wheel.style.transition = `transform ${spinDuration2}ms ease-in-out`;
                wheel.style.transform = `rotate(${rotations2 * 360}deg)`; 

                $('#left').text(0);
    
                setTimeout(() => {
                    setTimeout(() => {
                        showRegistration();
                        console.log(2);
                    }, 500);
                }, spinDuration2);
    
                setTimeout(() => {
                    spinBtn2.disabled = false;
                }, spinDuration2);
    
                spinBtn2.id = 'spinBtn3';
    
                document.getElementById('spinBtn3').addEventListener('click', function() {
                    showRegistration();
                });
            });
        }, spinDuration);
    });

});