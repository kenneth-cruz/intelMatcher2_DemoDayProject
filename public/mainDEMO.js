var thumbUp = document.getElementsByClassName("fa-thumbs-up");
var thumbDown = document.getElementsByClassName("fa-thumbs-down");
var trash = document.getElementsByClassName("fa-trash");


//Related to put/messages
Array.from(thumbUp).forEach(function(element) { //for each item called thumbs up (icon)
      element.addEventListener('click', function(){
        // name inside of a span, inside of li, indise of ul, from the UL back down to chose an li
        const name =
       this.parentNode.parentNode.childNodes[1].innerText //name isinside span and span inside of an li and li inside unordered list so going from where it is up to the li and up to the ul and then from the ul back down it can choose any of the li's.
       //Indexes alternate because:*********** request[0], answer[1], req[2], answer[3] and so on
       //think of styling css- same concept, cascading down thetagsto get to the actual target tag
        const msg = this.parentNode.parentNode.childNodes[3].innerText
        const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText) //parsefloat= string to integer rather than concatinatingit will add properly.
        console.log(this.parentNode.parentNode.childNodes[5], 'FISH')
        console.log(name, 'name')
        console.log(msg, 'msg')
        console.log(thumbUp, 'thumbUp')
        fetch('messages', {
          method: 'put',
          headers: {'Content-Type': 'application/json'}, //is the headers section by convention?
          body: JSON.stringify({
            'name': name,
            'msg': msg,
            'thumbUp':thumbUp
          })
        })

        .then(response => {
          if (response.ok) return response.json() //take the responses if they are ok, pass them into the dom
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});
// mirror image of thumbUp ...the difference is what is done to the
//number in the routes.js
Array.from(thumbDown).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const msg = this.parentNode.parentNode.childNodes[3].innerText
        const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
        console.log(thumbDown)
        fetch('thumbDown', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'name': name,
            'msg': msg,
            'thumbUp':thumbUp
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const msg = this.parentNode.parentNode.childNodes[3].innerText
        fetch('messages', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': name,
            'msg': msg
          })
        }).then(function (response) {
          window.location.reload() //take the response and reload the page
        })
      });
});





// part of the code that displays headlines of interest.


let topicChoice = document.getElementById('topicChoice')
let urlDisplayLink = document.getElementById('urlDisplayLink')
let titleDisplay = document.getElementById('titleDisplay')
let imageDisplay = document.getElementById('imageDisplay')

  document.getElementById('headlineSearcher').addEventListener('click', function(){

      fetch(`https://newsapi.org/v2/top-headlines?language=en&q=${topicChoice.value}&apiKey=10d4e4ba0b9a4c95b9ab5d81a4b1947d`)
      .then(res => res.json())
      .then(headlines => {
        let randomNumber = Math.floor(Math.random()*2)
        document.getElementById('titleDisplay').innerHTML = `${headlines.articles[randomNumber].title}`;
        document.getElementById('urlDisplayLink').href = `${headlines.articles[randomNumber].url}`;
        document.getElementById('urlDisplayLink').innerText = `${headlines.articles[randomNumber].url}`;
        document.getElementById('imageDisplay').src = `${headlines.articles[randomNumber].urlToImage}`;

        console.log(headlines, 'all the data')


      })
})

// make another onclick ... like a POST.
document.getElementById('swipeRight').addEventListener('click', function(){
  const link = urlDisplayLink.href
  const topic = titleDisplay.innerHTML
  const imageSRC = imageDisplay.src

  console.log(link, 'link')
  console.log(topic, 'topic')
  console.log(imageSRC, 'imageSRC')

  fetch('topics', {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'topic': topic,
      'link': link,
      'imageSRC':imageSRC
    })
  })

  .then(function (response) {
    window.location.reload() //take the response and reload the page
  })
  // .then(data => {
  //   console.log(data)
  //   window.location.reload()
  // })
});

document.getElementById('swipeLeft').addEventListener('click', function(){
  alert('search again');
  window.location.reload()
})
