/*
Написать приложение для работы с REST сервисом, все функции делают запрос и возвращают Promise с которым потом можно работать. Реализовать следующий функционал:
функция getAllUsers() - должна вернуть текущий список всех пользователей в БД.
функция getUserById(id) - должна вернуть пользователя с переданным id.
функция addUser(name, age) - должна записывать в БД юзера с полями name и age.
функция removeUser(id) - должна удалять из БД юзера по указанному id.
функция updateUser(id, user) - должна обновлять данные пользователя по id. user это объект с новыми полями name и age.
Документацию по бэкенду и пример использования прочитайте здесь .
Сделать минимальный графический интерфейс в виде панели с полями и кнопками. А так же панелью для вывода результатов операций с бэкендом.
*/

const apiUrl = "https://test-users-api.herokuapp.com/users/";

const htmlTpl = document.querySelector("#table-row").textContent.trim();
const compiled = _.template(htmlTpl);
// Получает массив объектов пользователей и используя LoDash рендерит результат
const updateView = (usersInfo) => {
  let htmlString = "";

  usersInfo.forEach(item => {
    htmlString += compiled(item);
  });

  tBody.innerHTML = htmlString;
};

const hideResultBtn = document.querySelector(".hide-res");
const showResultBtn = document.querySelector(".show-res");
const tBody = document.querySelector("#js-tbody");

//Callback для кнопок HIDE
const hideResult = function () {
  result.setAttribute('hidden', true);
}
hideResultBtn.addEventListener("click", hideResult);

// Callback для кнопок SHOW
const showResult = function () {
  result.removeAttribute('hidden');
}
showResultBtn.addEventListener("click", showResult);

//=======getAllUsers()=======//
const getAllUsersBtn = document.querySelector(".js-get");
const result = document.querySelector(".result-panel__table");

function getAllUsers(evt) {
  evt.preventDefault();
  fetch(apiUrl)
    .then(response => {
        if(response.ok) return response.json();
        throw new Error("Error fetching data");
    })
    .then(users => {
      console.log(users);
        const usersInfo = users.data;
        updateView(usersInfo);
        result.removeAttribute('hidden');
    })
    .catch(error => {
      console.error("Error: ", error);
    });
}
getAllUsersBtn.addEventListener("click", getAllUsers);

//=======getUserById(id)=======//
const searchByIdBtn = document.querySelector(".js-get-id");
const inputId = document.querySelector(".input-id");

//===Первый способ: блин-ком (получает всех пользователей и самостоятельно ищет)===//
// function getUserById(evt) {
//   evt.preventDefault();
//   fetch(apiUrl)
//     .then(response => {
//         if(response.ok) return response.json();
//         throw new Error("Error fetching data");
//     })
//    .then(users => {
//         const usersInfo = users.data;
//        const user = usersInfo.find(item => item.id === inputId.value);
//        if (user) {
//          updateView([user]);
//          result.removeAttribute('hidden');
//          inputId.value = "";
//        } else {
//          alert(`Пользователя с таким ID в базе нет!`);
//           inputId.value = "";
//        }
//     })
//     .catch(error => {
//       console.error("Error: ", error);
//     });
// }

// Второй способ: cогласно документации backend
// GET https://test-users-api.herokuapp.com/users/:id
// Show your only one user by id. No parameters.
function getUserById(evt) {
  evt.preventDefault();
  fetch(`${apiUrl}${inputId.value}`)
    .then(response => {
        if(response.ok) return response.json();
        throw new Error("Error fetching data");
    })
    .then(users => {
      console.log(users);
      if (users.status === 500) {
        alert(`Пользователя с ID: ${inputId.value} в базе нет!`);
        inputId.value = "";
        throw new Error(users.errors[0]);
      }
      else if (users.status === 404) {
          alert(`Пользователя с ID: ${inputId.value} не найден!`);
          inputId.value = "";
          throw new Error(users.errors[0]);
          //5af08d50a0738800140e0c37
      }
      else if (!inputId.value) {
          alert(`Вы не ввели данные!`);
      }
      else {
          updateView([users.data]);
          result.removeAttribute('hidden');
          inputId.value = "";
      }
    })
    .catch(error => {
      console.error("Error: ", error);
    });
}
searchByIdBtn.addEventListener("click", getUserById);

//=======addUser=======//
const addUserBtn = document.querySelector(".js-post-add");
const inputName = document.querySelector(".input-add-name");
const inputAge = document.querySelector(".input-add-age");

function addUser(evt) {
  evt.preventDefault();
  fetch(apiUrl, {
  method: 'POST',
  body: JSON.stringify({ name: inputName.value, age: inputAge.value}),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
})
    .then(response => {
        if(response.ok) return response.json();
        throw new Error("Error fetching data");
    })
    .then(users => {
        if (users.status === 500) {
          alert("Вы ввели некорректные данные");
          inputName.value = "";
          inputAge.value = "";
          throw new Error(users.errors[0]);
        }
        alert(`Пользователь ${inputName.value}, ${inputAge.value} лет успешно добавлен в базу с ID: ${users.data._id}`)
        inputName.value = "";
        inputAge.value = "";

    })
    .catch(error => {
      console.error("Error: ", error);
    });
}
addUserBtn.addEventListener("click", addUser);

//=======removeUser=======//
const removeUserBtn = document.querySelector(".js-post-remove");
const inputRemoveById = document.querySelector(".input-remove");

function removeUser(evt) {
  evt.preventDefault();
  fetch(`${apiUrl}${inputRemoveById.value}`, {
  method: 'DELETE',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
})
    .then(response => {
        if(response.ok) return response.json();
        throw new Error("Error fetching data");
    })
    .then(users => {
      console.log(users);
      if(users.status === 500) {
        alert(`Пользователя с таким ID в базе нет!`);
        inputRemoveById.value = "";
      } else if (!inputRemoveById.value) {
          alert(`Вы не ввели данные!`);
      } else if (!users.data) {
          alert (`Пользователь с ID: ${inputRemoveById.value} уже был удален из базы ранее`);
          inputRemoveById.value = "";
          throw new Error("User has been deleted early");
      } else {
          alert(`Пользователь с ID: ${inputRemoveById.value}, name: ${users.data.name} удален из базы!`);
          inputRemoveById.value = "";
      }
    })
    .catch(error => {
      console.error("Error: ", error);
    });
}
removeUserBtn.addEventListener("click", removeUser);

//=======updateUser=======//
const updateUserBtn = document.querySelector(".js-put-update");
const inputUpdateById = document.querySelector(".input-update-id");
const inputUpdateName = document.querySelector(".input-update-name");
const inputUpdateAge = document.querySelector(".input-update-age");

function updateUser(evt) {
    evt.preventDefault();
    fetch(`${apiUrl}${inputUpdateById.value}`, {
      method: 'PUT',
      body: JSON.stringify({name: inputUpdateName.value, age: inputUpdateAge.value}),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
        if(response.ok) return response.json();
        throw new Error("Error fetching data");
    })
    .then(users => {
      console.log(users);
      if (!inputUpdateById.value) {
        alert('Вы не ввели данные!')
      } else if (users.status === 500 || users.status === 404) {
        alert(`Пользователя с ID: ${inputUpdateById.value} не найден!`);
        inputUpdateById.value = "";
        throw new Error(users.errors[0]);
      } else {
        updateView([users.data]);
        result.removeAttribute('hidden');
        inputUpdateById.value = "";
        inputUpdateName.value = "";
        inputUpdateAge.value = "";
      }
    })
    .catch(error => {
      console.error("Error: ", error);
    });
}
updateUserBtn.addEventListener("click", updateUser);
