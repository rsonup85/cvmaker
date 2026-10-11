(function(){
  var links = document.querySelectorAll('[data-app-link]');
  links.forEach(function(a){ a.addEventListener('click', function(){ try{ localStorage.removeItem('cvmaker_landing_mode'); }catch(e){} }); });
})();
