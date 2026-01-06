//$(document).ready(function () {

// service slider
// $(".service__slider").slick({
//   infinite: false,
//   slidesToShow: 3,
//   slidesToScroll: 1,
//   dots: false,
//   arrows: false,
//   responsive: [
//     {
//       breakpoint: 992,
//       settings: {
//         slidesToShow: 2,
//         slidesToScroll: 1,
//         dots: true,
//       },
//     },
//     {
//       breakpoint: 768,
//       settings: {
//         slidesToShow: 1,
//         slidesToScroll: 1,
//         dots: true,
//       },
//     },
//   ],
// });

// Testimonial slider
//$(".testimonial__slider").slick({
//  infinite: true,
//  slidesToShow: 2,
// slidesToScroll: 1,
//dots: true,
//arrows: false,
//autoplay: true,
//autoplaySpeed: 2000,
//responsive: [
//{
//breakpoint: 992,
//settings: {
//slidesToShow: 1,
//slidesToScroll: 1,
//infinite: true,
//dots: true,
//},
//},
//],
//});

window.marker = null;

function initialize() {
    var map;
    var lat = $("#map").data("lat");
    var long = $("#map").data("long");
    var mapCenter = new google.maps.LatLng(lat, long);

    var mapOptions = {
        // SET THE CENTER
        center: mapCenter,
        // SET THE MAP STYLE & ZOOM LEVEL
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        // REMOVE ALL THE CONTROLS EXCEPT ZOOM
        zoom: 13,
        panControl: false,
        scrollwheel: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
        },
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    // SET THE MAP TYPE
    var marker_image = $("#map").data("pin");
    var pinIcon = new google.maps.MarkerImage(
        marker_image,
        null,
        null,
        null,
        new google.maps.Size(25, 34),
    );
    marker = new google.maps.Marker({
        position: mapCenter,
        map: map,
        icon: pinIcon,
        title: "bizcred",
    });
}

//if ($("#map").length > 0) {
//google.maps.event.addDomListener(window, "load", initialize);
//}

const hamburger = document.querySelector("nav button");

function processClick(event) {
    event.preventDefault();
    const navbar = document.getElementById("navbarCollapse");
    navbar.classList.toggle("collapse");
}

function animateProgress() {
    document.querySelectorAll("#skill progress").forEach((el) => {
        const max = parseInt(el.dataset.max);
        let val = parseInt(el.getAttribute("value"));
        const id = setInterval(frame, 10);

        function frame() {
            if (val <= max) {
                el.setAttribute("value", val++);
            } else {
                clearInterval(id);
            }
        }
    });
}

function processScroll() {
    const navbar = document.querySelector("nav");

    if (window.scrollY > 200) {
        navbar.classList.add("nav__color__change");
    } else {
        navbar.classList.remove("nav__color__change");
    }
}

function onLoad() {
    processScroll();
    animateProgress();
}

function onScroll() {
}

hamburger.onclick = processClick;
window.onload = onLoad;
window.onscroll = onScroll;
