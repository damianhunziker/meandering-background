document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1'; // Set z-index to -1 to position the canvas behind the text
    canvas.style.opacity = '0.2'; // Set canvas opacity to 20%
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    var baseColors = [
        {r: 255, g: 0, b: 0},
        {r: 0, g: 255, b: 0},
        {r: 0, g: 0, b: 255},
        {r: 255, g: 255, b: 0},
        {r: 0, g: 255, b: 255}
    ];

    function getRandomRadius() {
        if (window.innerWidth <= 768) { // Mobile devices
            return Math.random() * (canvas.width * 0.25) + (canvas.width * 0.25);
        } else { // Desktop devices
            return Math.random() * (canvas.width * 0.25) + (canvas.width * 0.1);
        }
    }

    function saveCirclesToSession() {
        sessionStorage.setItem('circles', JSON.stringify(circles));
    }

    function loadCirclesFromSession() {
        var savedCircles = sessionStorage.getItem('circles');
        if (savedCircles) {
            return JSON.parse(savedCircles);
        }
        return null;
    }

    var circles = loadCirclesFromSession() || [
        {x: 100, y: 100, vx: 2, vy: 2, radius: getRandomRadius(), color: {...baseColors[0], a: 1}},
        {x: 200, y: 200, vx: -2, vy: 2, radius: getRandomRadius(), color: {...baseColors[1], a: 1}},
        {x: 300, y: 300, vx: 2, vy: -2, radius: getRandomRadius(), color: {...baseColors[2], a: 1}},
        {x: 400, y: 400, vx: -2, vy: -2, radius: getRandomRadius(), color: {...baseColors[3], a: 1}},
        {x: 500, y: 500, vx: 2, vy: 2, radius: getRandomRadius(), color: {...baseColors[4], a: 1}}
    ];

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var lastMouseMoveTime = Date.now();

    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        lastMouseMoveTime = Date.now();
    });

    document.addEventListener('touchmove', function (e) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        lastMouseMoveTime = Date.now();
    });

    function handleCollisions() {
        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                let dx = circles[j].x - circles[i].x;
                let dy = circles[j].y - circles[i].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < circles[i].radius + circles[j].radius) {
                    let angle = Math.atan2(dy, dx);
                    let sin = Math.sin(angle);
                    let cos = Math.cos(angle);

                    let x0 = 0;
                    let y0 = 0;
                    let x1 = dx * cos + dy * sin;
                    let y1 = dy * cos - dx * sin;

                    let vx0 = circles[i].vx * cos + circles[i].vy * sin;
                    let vy0 = circles[i].vy * cos - circles[i].vx * sin;
                    let vx1 = circles[j].vx * cos + circles[j].vy * sin;
                    let vy1 = circles[j].vy * cos - circles[j].vx * sin;

                    let vxTotal = vx0 - vx1;
                    vx0 = ((circles[i].radius - circles[j].radius) * vx0 + 2 * circles[j].radius * vx1) / (circles[i].radius + circles[j].radius);
                    vx1 = vxTotal + vx0;

                    x0 += vx0;
                    x1 += vx1;

                    circles[i].x = circles[i].x + (x0 * cos - y0 * sin);
                    circles[i].y = circles[i].y + (y0 * cos + x0 * sin);
                    circles[j].x = circles[i].x + (x1 * cos - y1 * sin);
                    circles[j].y = circles[i].y + (y1 * cos + x1 * sin);

                    circles[i].vx = vx0 * cos - vy0 * sin;
                    circles[i].vy = vy0 * cos + vx0 * sin;
                    circles[j].vx = vx1 * cos - vy1 * sin;
                    circles[j].vy = vy1 * cos + vx1 * sin;
                }
            }
        }
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function updateColors() {
        var time = Date.now() * 0.002;
        circles.forEach(function(circle, index) {
            let baseColor = baseColors[index % baseColors.length];
            circle.color.r = clamp(Math.floor((Math.sin(time + index) + 1) / 2 * 255), 0, 255);
            circle.color.g = clamp(Math.floor((Math.sin(time + index + 2) + 1) / 2 * 255), 0, 255);
            circle.color.b = clamp(Math.floor((Math.sin(time + index + 4) + 1) / 2 * 255), 0, 255);
            circle.color.r = clamp((circle.color.r + baseColor.r) / 2, 0, 255);
            circle.color.g = clamp((circle.color.g + baseColor.g) / 2, 0, 255);
            circle.color.b = clamp((circle.color.b + baseColor.b) / 2, 0, 255);
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';

        circles.forEach(function(circle) {
            var timeSinceLastMove = Date.now() - lastMouseMoveTime;
            if (timeSinceLastMove < 1000) {
                circle.x += (mouseX - circle.x) * 0.01 + circle.vx;
                circle.y += (mouseY - circle.y) * 0.01 + circle.vx;
            } else {
                circle.x += circle.vx;
                circle.y += circle.vy;
            }

            if (circle.x < 0 || circle.x > canvas.width) circle.vx *= -1;
            if (circle.y < 0 || circle.y > canvas.height) circle.vy *= -1;
        });

        handleCollisions();
        updateColors();

        circles.forEach(function(circle) {
            var gradient = ctx.createRadialGradient(circle.x, circle.y, 0, circle.x, circle.y, circle.radius);
            gradient.addColorStop(0, `rgba(${circle.color.r}, ${circle.color.g}, ${circle.color.b}, 1)`);
            gradient.addColorStop(1, `rgba(${circle.color.r}, ${circle.color.g}, ${circle.color.b}, 0)`);

            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });

        saveCirclesToSession();
        requestAnimationFrame(animate);
    }

    animate();
});