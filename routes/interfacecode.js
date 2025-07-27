$(document).ready(function(){

    var code = $(".codemirror-textarea")[0];
    var editor = CodeMirror.fromTextArea(code, {
        mode: 'python',
        lineNumbers : true,
        theme: 'default',
        indentUnit: 4,
        tabSize: 4
    });

    var width=window.innerWidth
    var input=document.getElementById("input")
    var output=document.getElementById("output")
    var run=document.getElementById("run")
    editor.setSize(0.7*width,"500")
    var code;
    run.addEventListener("click", async function(){
        code={
            code:editor.getValue(),
            input:input.value
        }
        var oData=await fetch("http://localhost:3000/compile",{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(code)
        })
        var d = await oData.json()
        output.value = d.output
    })
    
});