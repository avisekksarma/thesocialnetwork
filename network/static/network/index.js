document.addEventListener('DOMContentLoaded',function(){
    
    // activate the buttons for liking and unliking
    activate_buttons()

    // function to handle all the logics behind the editing of the posts
    handleEditPost()
})

function activate_buttons(){
    buttons = document.querySelectorAll('.like-unlike')
    buttons.forEach(button=>{
        button.addEventListener('click',e => {
            
            fetch(`/like/${button.dataset.id}`,{
                method: 'POST',
                mode:'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value
                },
                body: JSON.stringify({
                    do:`${button.dataset.do}`
                }),
                redirect:"follow",
                credentials: "include"
            })
            .then(res=>{
                if (!res.ok){
                    throw new Error(`HTTP ERROR - ${res.status}`)
                }else{
                    console.log('fine')
                    console.log(res)
                    if (res.redirected) {
                        window.location.href = res.url;
                    }
                    return res.json()
                }
            })
            .then(data=>{
                console.log(data)
                console.log(button.nextElementSibling)
                button.innerHTML = data.show
                button.setAttribute('data-do',`${data.show}`)
                button.nextElementSibling.innerHTML = data.likes
            })
            .catch(e=>{
                console.log(`An error occurred with name = ${e.name}`)
            })
        })
    })
}

function handleEditPost(){
    edit_links = document.querySelectorAll('.edit-link')
    if (edit_links.length != 0){
        // case when the edit links are in the page
        edit_links.forEach(link => {
            link.addEventListener('click',function(e){
                
                let content_div  = link.previousElementSibling
                let current_text = content_div.firstElementChild.innerText
                content_div.innerHTML = `<textarea name="edit" class="form-control" style="width:350px;height:130px;">${current_text}</textarea>
                <br>
                <button type="button" class="btn btn-primary save-changes">Save Changes</button>`
                
                // putting an eventlistener to the button to save changes.
                content_div.lastElementChild.addEventListener('click',e =>{
                    console.log('save btn clicked')
                    saveEditedPost(link,content_div)
                })
                // hide the link which says to edit the post 
                // as we are already in edit mode
                link.style.display = 'none';
            })
        })
    }
}

function saveEditedPost(link,content_div){
    fetch('/',{
        method: 'PUT',
        mode:'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value
        },
        body: JSON.stringify({
            id: link.dataset.id,
            content: content_div.firstElementChild.value
        }),
        redirect:"follow",
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        if (data.success){
            link.style.display = 'block';
            content_div.innerHTML = `<p>${data.new_content}</p>`
        }else{
            throw new Error('A PUT request by made by another user.')
        }
    })
    .catch(err => {
        console.log(`An error occurred: ${err.message}`)
    })
}