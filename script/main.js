"use strict";

let idCounter = 1;
let BugManagement = new BugManagementSystem();
let listOfBugs = $("div#listOfBugs");


$(document).ready(function(){

    $("#add").click(function(){
        addEntryBtn();
    });

    $("#showAll").click(function(){
        showAllEntries();
    });

    $("#showOpen").click(function(){
        showOpenEntries();
    });

    createPersons();
});



//Erstellt sechs Personen im Formular
function createPersons(){
    let select = $("#editorInput");

    let Gerta = new Person("Gerta", "Grüßdich");
    Gerta.draw(select);
    let Hans = new Person("Hans", "Huber");
    Hans.draw(select);
    let Frieda = new Person("Frieda", "Freutheut");
    Frieda.draw(select);
    let Susanne = new Person("Susanne", "Super");
    Susanne.draw(select);
    let Peter = new Person("Peter", "Putz");
    Peter.draw(select);
    let Gustav = new Person("Gustav", "Gutter");
    Gustav.draw(select);
}



//Fügt einen neuen Bug-Eintrag hinzu
function addEntryBtn(){

    let title = $("input#titleInput").val();
    let editor = $("#editorInput").val();
    let description = $("textarea#descriptionInput").val();


    //Prüfe zuerst, ob Name und Person(en) eingegeben wurden
    if(title != "" && editor != ""){

        //ein activeBug ist ein ausgewählter Bug (der mit Hintergrund hinterlegt ist)
        //und beim Klick auf "add" wird diesem activeBug ein Subbug hinzugefügt
        let activeBug = $(".background");

        if(activeBug.length == 0){
            //hier wird ein normaler Bug auf oberster Ebene hinzugefügt
            let newBug = new Bug(idCounter, title, editor, description);

            BugManagement.addBug(newBug);
            listOfBugs.empty();
            BugManagement.draw(listOfBugs);
        }
        else{
            //hier wird ein eingerückter Subbug zum activeBug hinzugefügt
            let activeBugId = activeBug.attr("id");
            let newSubbug = new Bug(idCounter, title, editor, description);
            let rootBug = BugManagement.getBugByID(activeBugId);

            rootBug.addSubbug(newSubbug);
            listOfBugs.empty();
            BugManagement.draw(listOfBugs);
        }

        markActiveBug();
        changeCheckboxes()
        deleteElement();

        idCounter++;
    }
    else{
        alert("Please enter title and select at least one editor");
    }
}



//Hinterlegt den "aktiven Bug" mit Hintergrundfarbe
//es kann dabei immer nur einen aktiven Bug geben
function markActiveBug(){

    let bugEntry = $(".bugEntry");
    for(let i of bugEntry){
        i.onclick = function (){

            let notID = ":not(#" + i.id + ")";
            let activeEntries = $(".bugEntry" + notID); //selektiert alle Bugs außer den aktuell aktiven

            for(let i of activeEntries){
                if(i.classList.contains("background")){
                    i.classList.remove("background");
                }
            }
            if(this.classList.contains("background")){
                this.classList.remove("background");
            }
            else{
                this.classList.add("background");
            }
        }
    }
}



//Ändert den Status eines Bugs per Klick auf die Checkbox

//Anmerkung: bei der Übung 3 wurde bei dieser function mit CSS-Klassen gearbeitet, d.h. ich habe dabei immer
//nach jenen divs gesucht, die die Klasse "checked" oder "not_checked" hatten und dann dementsprechend
//die CSS-Klasse geändert (um die Farbe zu ändern).
//Im Verlauf dieser Übung 7 bemerkte ich, dass es vermutlich nun klüger gewesen wären, die Bugs anhand ihres
//Status (state: "open" / state: "closed") zu suchen und dann gemeinsam mit dem Status die CSS-Klasse zu ändern
//(wäre einerseits mehr objektorientiert aber vermutlich auch einfacher und unkomplizierter gewesen :D )
//Als ich da draufgekommen bin, war diese function aber schon fertig und ich wollte dementsprechend nicht
//nochmal das komplette System dahinter überarbeiten.
//Ich hoffe, das passt trotzdem so :)

function changeCheckboxes(){

    let checkbox = $("input[type=checkbox]");

    for(let i of checkbox){
        i.onclick = function (){

            let bugDiv = i.parentElement.parentElement;
            let bugID = $(i).parent().parent().attr("id");
            let clickedBug = BugManagement.getBugByID(bugID);

            if(bugDiv.classList.contains("checked")) {
                //Bug ist geschlossen und soll offen werden:

                if(clickedBug.parent != undefined) {
                    //nicht undefined => Bug hat übergeordnete Bugs, die beim Klick auf
                    //den aktuellen Bug auch wieder offen werden sollen

                    let parentBug = clickedBug.parent;

                    //alle übergeordneten Bugs sollen ebnefalls wieder offen werden:
                    while(parentBug != undefined){
                        parentBug.entry[0].classList.remove("checked");
                        parentBug.entry[0].classList.add("not_checked");
                        parentBug.entry[0].firstElementChild.firstElementChild.checked = false;
                        parentBug.state = "open";
                        parentBug = parentBug.parent;
                    }
                    bugDiv.classList.remove("checked");
                    bugDiv.classList.add("not_checked");
                    clickedBug.state = "open";
                }
                else{
                    //undefined => Bug hat keine übergeordneten Bugs
                    bugDiv.classList.remove("checked");
                    bugDiv.classList.add("not_checked");
                    clickedBug.state = "open";
                }
            }
            else if(bugDiv.classList.contains("not_checked")) {
                //Bug ist offen und soll geschlossen werden:

                //alle untergeordneten Subbugs müssen ebenfalls geschlossen sein, damit
                //der aktuelle Bug geschlossen werden kann.

                if(clickedBug.subbugs.size == 0){
                    //size==0 => aktueller Bug hat keine Subbugs und kann einfach geschlossen werden

                    bugDiv.classList.remove("not_checked");
                    bugDiv.classList.add("checked");
                    clickedBug.state = "closed";

                }
                else{
                    //size!=0 => aktueller Bug hat Subbugs, die geschlossen sein müssen

                    //check prüft, ob der aktuelle Bug geschlossen werden darf oder nicht
                    let check = true;

                    for(let i of clickedBug.subbugs.values()){
                        //wenn einer der Subbugs noch offen ist, wird check zu false
                        if(i.entry[0].classList.contains("not_checked")){
                            check = false;
                            break;
                        }
                    }

                    if(check){
                        //Der aktuelle Bug darf geschlossen werden:
                        bugDiv.classList.remove("not_checked");
                        bugDiv.classList.add("checked");
                        clickedBug.state = "closed";
                    }
                    else{
                        //Der aktuelle Bug kann nicht geschlossen werden, es kommt eine Meldung dazu.
                        alert("In order to close this bug, all its subbugs must be closed too.");
                        i.checked = false;
                    }
                }
            }
        }
    }
}



//Löscht beim klick auf "X" einen Bug aus dem BugManagementSystem und aus dem DOM-Baum
function deleteElement(){

    let xBtn = $("button");

    for(let i of xBtn) {
        i.onclick = function () {

            let bugID = $(i).parent().parent().attr("id");
            let bugToDelete = BugManagement.getBugByID(bugID);
            let title = bugToDelete.title;

            if (confirm("Do you really want to delete the bug \"" + title + "\" together \n" +
                "with all its subbugs?")) {
                if(bugToDelete.parent == undefined){
                    BugManagement.bugList.delete(bugToDelete.id);
                }
                else{
                    bugToDelete.parent.subbugs.delete(bugToDelete.id);
                }
                listOfBugs.empty();
                BugManagement.draw(listOfBugs);

                markActiveBug();
                changeCheckboxes()
                deleteElement();
            }
        }
    }
}



//Zeigt alle noch offenen Einträge
function showOpenEntries(){

    let checkedEntry = $("div.checked");
    for(let i of checkedEntry){
        i.style.display = "none";
    }
}



//Zeigt alle Einträge (=blendt alle versteckten Einträge wieder ein)
function showAllEntries(){

    let hiddenEntry = $("div#listOfBugs div.bugEntry");
    for(let i of hiddenEntry) {
        if (i.style.display === "none") {
            i.style.display = "flex";
        }
    }
}
