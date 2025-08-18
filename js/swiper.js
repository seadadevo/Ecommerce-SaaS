var swiper = new Swiper(".swiper_1", {
    slidesPerView: 1,
    autoplay: {
        delay: 2500,
    },
    loop: true,
    effect: "coverflow",
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullests: true,
    },
});


// ! Slider 2 for Products that have discount
var swiper = new Swiper(".slide_product", {
    slidesPerView: 5,
    spaceBetween: 20,
    navigation: {
        nextEl:".swiper-button-next",
        prevEl:".swiper-button-prev" 
    },
    autoplay: {
        delay: 2500,
    },
    loop: true,
    breakpoints:{
        1200:{
            slidesPerView: 5,
            spaceBetween: 20,
        } ,
        1000: {
            slidesPerView: 4,
            spaceBetween: 20,
        },
        700: {
            slidesPerView: 3,
            spaceBetween: 15,
        },
        500: {
            slidesPerView: 2,
            spaceBetween: 15,
        },
        0: {
            slidesPerView: 1,
        },
    }
    });