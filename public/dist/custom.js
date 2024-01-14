function FormValidation(){
    // alert()
    var name = document.js_form.name
    if(name.value == ""){
        name.nextElementSibling.style.display="block";
        name.style.border = "1px solid red"
        return false
    }
}