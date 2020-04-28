var heart = document.getElementsByClassName("fa-heart");
var trash = document.getElementsByClassName("fa-trash");
const baseURL = 'http://localhost:8080/'

Array.from(heart).forEach(function(element) {
      element.addEventListener('click', function(){
        const pictureInfo = this.parentNode.parentNode.childNodes[1].childNodes[1].src
        console.log(pictureInfo, 'pictureInfo')
        const relativeURL = pictureInfo.split(baseURL)[1]
        const pictureCaption = this.parentNode.parentNode.childNodes[3].innerText
        console.log(pictureCaption, 'pictureCaption')
        fetch('heart', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            caption: pictureCaption,
            imgPath: relativeURL
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
        const pictureInfo = this.parentNode.parentNode.childNodes[1].childNodes[1].src
        console.log(pictureInfo, 'pictureInfo');
        const relativeURL = pictureInfo.split(baseURL)[1]
        const reducedPictureInfo = pictureInfo.slice(22)
        console.log(reducedPictureInfo, 'reduced')
        const caption = this.parentNode.parentNode.childNodes[3].innerText
        console.log(caption, 'caption');
        fetch('zoinks', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            caption: caption,
            imgPath: relativeURL
          })
        }).then(function (response) {
          console.log(response)
          // chrome dev tools uses this (below) to pause execution.
          // debugger
          window.location.reload()
        })
      });
});



///////// DEMO DAY /////////////////

let topicChoice = document.getElementById('topicChoice')
let urlDisplayLink = document.getElementById('urlDisplayLink')
let titleDisplay = document.getElementById('titleDisplay')
let imageDisplay = document.getElementById('imageDisplay')


topicChoice.addEventListener('keyup', function(event) {
  if (event.keyCode === 13) {
     event.preventDefault();
     document.getElementById("headlineSearcher").click();
    }
});
  document.getElementById('headlineSearcher').addEventListener('click', function hello(){

      fetch(`https://newsapi.org/v2/top-headlines?language=en&q=${topicChoice.value.toLowerCase()}&apiKey=10d4e4ba0b9a4c95b9ab5d81a4b1947d`)
      .then(res => res.json())
      .then(headlines => {
        // let randomNumber = Math.floor(Math.random()*2)
        document.getElementById('titleDisplay').innerHTML = `${headlines.articles[1].title}`;
        document.getElementById('urlDisplayLink').href = `${headlines.articles[1].url}`;
        document.getElementById('urlDisplayLink').innerText = `${headlines.articles[1].url}`;
        console.log(headlines.articles[1].urlToImage)
        // document.getElementById('imageDisplay').src = `${headlines.articles[1].urlToImage}`;

        console.log(headlines, 'all the data')


      })

      fetch(`https://pixabay.com/api/?key=16231649-cda0457639d81c5ea1819be58&q=${topicChoice.value.toLowerCase()}&image_type=photo`)
            .then(res => res.json())
            .then(media => {
              // let randomNumber = Math.floor(Math.random()*2)
              document.getElementById('imageDisplay').src = `${media.hits[1].largeImageURL}`;
              console.log(media, 'photo should appear')
            })

})

// make another onclick ... like a POST.
document.getElementById('swipeRight').addEventListener('click', function(){
  const link = urlDisplayLink.href
  const topic = titleDisplay.innerHTML
  const imageSRC = imageDisplay.src
  const keyword = topicChoice.value

  console.log(link, 'link')
  console.log(topic, 'topic')
  console.log(imageSRC, 'imageSRC')
  console.log(keyword, 'topicChoice')

  fetch('topics', {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'topic': topic,
      'link': link,
      'imageSRC':imageSRC,
      'keyword':keyword
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
