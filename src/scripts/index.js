import 'jquery.scrollto';
import { test } from './test';

// $ = jquery "for free".
$( document ).ready(function(){
  console.log( 'Ready?' );
  test();

  $('a.brand').click( function() {
    e.preventDefault();
    $(window).scrollTo(3000, { duration: 333 });
  });
});

function toggleNavBar() {
  $('.banner .menu-nav').slideToggle(500);
}
$('#menu-toggle').click( toggleNavBar );

$(document).ready(function(){
  $('#nav-icon3').click(function(){
    $(this).toggleClass('open');
  });
});

window.sr = ScrollReveal();
//sr.reveal('.splash-item');
sr.reveal('.splash-item', { duration: 2000 }, 50);