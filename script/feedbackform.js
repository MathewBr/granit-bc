document.addEventListener("DOMContentLoaded", () => {
   document.querySelector('body').insertAdjacentHTML('beforeend', fragment);
   processingInputFile('label_file', 'input_file');
   learnMore();
});

let fragment = `<div class="wrap_form">
   <div class="conteiner_form">
      <form id="jampform" name="formFeedback" enctype="multipart/form-data" method="post" onsubmit="send(event, 'script/send.php')"
         action="send.php">
         <div class="cross"><span></span><span></span><span></span></div>
         <div class="elem_form title">
            <h2>CONTACT US</h2>
            <!-- <div class="line"></div> -->
            <span id="cross"><span></span><span></span></span>
         </div>
         <div class="elem_form">
            <label for="input_name" class="label_input">
               <span>Name</span>
            </label>
            <input class="forjampform" id="input_name" type="text" name="name">
         </div>
         <div class="elem_form">
            <label for="input_email" class="label_input">
               <span>Email</span>
            </label>
            <input class="forjampform" id="input_email" type="email" name="email">
         </div>
         <div class="elem_form">
            <label for="input_textarea" class="label_input">
               <span>Additional information</span>
            </label>
            <textarea id="input_textarea" name="comment"></textarea>
         </div>
         <div class="elem_form">
            <label id="label_file" for="input_file" class="label_input" tabindex="0">
               <span>You can attach a file</span>
            </label>
            <input class="forjampform" id="input_file" type="file" name="file" tabindex="-1">
         </div>
         <div class="elem_form">
            <input class="forjampform" id="submit_form" type="submit" value="Submit">
         </div>
      </form>
      </div >
   </div > `;

function processingInputFile(strLable, strInput) {
   let inputFile = document.getElementById(strInput);
   let label = document.getElementById(strLable).firstElementChild;
   let info = label.innerText;
   inputFile.addEventListener('change', () => {
      if (inputFile.value) {
         label.innerText = inputFile.value.split(/\\|\//).pop();
      } else {
         label.innerText = info;
      }
   })
}

function send(event, php) {
   event.preventDefault();
   var req = new XMLHttpRequest();
   req.open('POST', php, true);
   req.onload = function () {
      if (req.status >= 200 && req.status < 400) {
         let json = JSON.parse(this.response); // Ебанный internet explorer 11
         console.log(json);

         // ЗДЕСЬ УКАЗЫВАЕМ ДЕЙСТВИЯ В СЛУЧАЕ УСПЕХА ИЛИ НЕУДАЧИ
         if (json.result == "success") {
            // Если сообщение отправлено
            alert("Сообщение отправлено");
         } else {
            // Если произошла ошибка
            alert("Ошибка. Сообщение не отправлено");
         }
         // Если не удалось связаться с php файлом
      } else {alert("Ошибка сервера. Номер: " + req.status);}
   };

   req.onerror = function () {alert("Ошибка отправки запроса");};
   req.send(new FormData(event.target));
}

function learnMore() {
   let button = document.getElementById('learnMore');
   if (button) {
      let wrap = document.querySelector('body').querySelector('.wrap_form');
      let conteiner = document.querySelector('.conteiner_form');
      let cross = document.getElementById('cross');
      button.addEventListener('click', () => {
         wrap.style.visibility = 'visible';
         conteiner.classList.add('jamp');
      });

      cross.addEventListener('click', () => {
         conteiner.classList.remove('jamp');
         conteiner.addEventListener('transitionend', () => {
            if (!conteiner.classList.contains('jamp')) wrap.style.visibility = 'hidden';
         });
      });
   }
}