//==============================================================
//Klasse erstellt das Bug-Management-System
//==============================================================
class BugManagementSystem{
    constructor() {
        this.bugList = new Map();
    }

    addBug(bug){
        this.bugList.set(bug.id , bug);
    }

    draw(parent){
        for(let i of this.bugList.values()){
            i.draw(parent, 0);
        }
    }

    getBugByID(id){
        for(let i of this.bugList.values()){
            let bug = i.findBugByID(id);
            if(bug){
                return bug;
            }
        }
        return undefined;
    }
}


BugManagementSystem.id = 1;



//==============================================================
//Klasse erstellt einen Bug-Eintrag im Bug-Management-System
//==============================================================
class Bug{
    constructor(id, title, editor, description) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.subbugs = new Map();
        this.parent = undefined;

        let personCount = 0;
        let persons = [];

        for(let name of editor.values()){
            let splitName = name.split(" ");
            let firstname = splitName[0];
            let lastname = splitName[1];

            persons[personCount] = new Person(firstname, lastname);
            personCount++;
        }

        this.editor = persons;
        this.state = "open";
    }

    findBugByID(id){
        if(this.id == id){
            return this;
        }
        else{
            for(let i of this.subbugs.values()){
                let foundBug = i.findBugByID(id);
                if(foundBug){
                    return foundBug;
                }
            }
        }
    }

    addSubbug(subbug){
        this.subbugs.set(subbug.id, subbug);
        subbug.parent = this;
    }

    draw(parent, padding){
        let editorString = "";
        let indexCount = 0;
        for(let i of this.editor.values()){
            let person = i.getPersonsName();

            if(indexCount === this.editor.length-1){
                editorString += person;
            }
            else{
                editorString += person + ", ";
            }
            indexCount++;
        }

        let stateCSS;
        let checkboxChecked;
        if(this.state == "open"){
            stateCSS = "not_checked";
            checkboxChecked = "";
        }
        else{
            stateCSS = "checked";
            checkboxChecked = "checked";
        }

        this.entry =
            $(`<div id=${this.id} class="bugEntry ${stateCSS}">
            <div>
                <input type="checkbox" ${checkboxChecked}>
                <p class="inline">${this.title} (${editorString})</p>
                <p>${this.description}</p>
            </div>
            <div class="floatRight">
                <button>✖</button>
            </div>
        </div>`);

        this.entry.css("padding-left", padding);
        parent.append(this.entry);
        for (let i of this.subbugs.values()){
            i.draw(parent, padding + 30);
        }
    }
}



//==============================================================
//Klasse erstellt eine Person mit Vor- und Nachnamen
//==============================================================
class Person{
    constructor(firstname, lastname) {
        this.firstname = firstname;
        this.lastname = lastname;
    }

    draw(parent){
        this.person =
            $(`<option>${this.firstname} ${this.lastname}</option>`);
        parent.append(this.person);
    }

    getPersonsName(){
        return String(this.firstname + " " + this.lastname);
    }
}
