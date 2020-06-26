let id = document.querySelector('#_id');
let issue_title = document.querySelector('#issue_title');
let created_by = document.querySelector('#created_by');
let assigned_to = document.querySelector('#assigned_to');
let created_on_from = document.querySelector('#created_on_from');
let created_on_to = document.querySelector('#created_on_to');
let updated_on_from = document.querySelector('#updated_on_from');
let updated_on_to = document.querySelector('#updated_on_to');
let status_text = document.querySelector('#status_text');
let open = document.querySelector('#open');
let arr = [issue_title, created_by, assigned_to, created_on_from, created_on_to, updated_on_from, updated_on_to, status_text, open];

id.addEventListener('input', () => {
    if (id.value != "") {
        arr.forEach(el => {
            console.log(el);
            if (el.value != "") el.value = "";
            if (!(el.disabled)) el.disabled = true;
        });
    }
    else {
        arr.forEach(el => {
            if (el.disabled) el.disabled = false;
        });
    }
});