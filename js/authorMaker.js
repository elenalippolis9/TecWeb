var c = 0;
var a = 0;
var current_scene = "";
var storyData = {"Info" : ["", "", ""], "Skin" : ["", "Angolo in alto a sinistra", "", "Angolo in alto a destra"]};
var sceneData = {"Testo scena" : ["", "", "", ""], "Audio scena" : "", "Sfondo scena" : "", "Video scena" : "", "Colore sfondo" : "", "Tipologia attivita" : ["", "", [{"Risposta" : ""}, ], "", {"Attività errore" : {}}]};

$(() => {

    document.getElementById("addScene").addEventListener("click", add_scene);
    document.getElementById("activity").addEventListener("click", createActivity)
    var previewViewers = document.getElementsByClassName("previewViewer");
    previewViewers[0].addEventListener("click", switchText);
    previewViewers[1].addEventListener("click", switchText);
    document.getElementById("deleteScene").addEventListener("click", () =>
    {
        if(document.getElementById(current_scene))
        {
            document.getElementById("scenes_list").removeChild(document.getElementById(current_scene).parentNode);
            document.getElementById("scenes_list").childNodes[0].lastChild.click();
        }
    });

    document.getElementById("download").addEventListener("click", () => {

        resetActivityForm(0);
        updateStoryData();
        document.getElementById("activity_container").style.display = "flex";
        document.getElementById("formContainer").style.display = "flex";
        var sortedStory = getStory();
        var file = new Blob([JSON.stringify(sortedStory, null, 2)], {type: "application/json"});

        if(document.getElementById("story_name"))
        {
            saveAs(file, document.getElementById("story_name").value);
        }
        else
        {
            saveAs(file, document.getElementById("story-name").innerHTML);
        }
    });

    document.getElementById("upload-widget").addEventListener("change", (uploadStoryEvent) => {
        
        c = 0;
        a = 0;
        sceneData = {"Testo scena" : ["", "", "", ""], "Audio scena" : "", "Sfondo scena" : "", "Video scena" : "", "Colore sfondo" : "", "Tipologia attivita" : ["", "", [{"Risposta" : ""}, ], "", {"Attività errore" : {}}]};
        var file = uploadStoryEvent.target.files[0];
        var reader = new FileReader();
        reader.onload = (data) => { 
            var uploadedStory = data.target.result; 
            storyData = JSON.parse(uploadedStory);
            buildUploadedStory();
        };
        reader.readAsText(file);
    });

    document.getElementById("chatSkin").addEventListener("change", file_upload);
    document.getElementById("helpSkin").addEventListener("change", file_upload);
    document.getElementById("textSkin").addEventListener("change", file_upload);
    document.getElementById("chatPosition").addEventListener("change", (chatPosEvent) => { 
        storyData["Skin"][1] = chatPosEvent.target.value;
        movingChatORhelp(document.getElementById("chatA"), chatPosEvent.target.value);
    });
    document.getElementById("helpPosition").addEventListener("change", (chatPosEvent) => {
        storyData["Skin"][3] = chatPosEvent.target.value;
        movingChatORhelp(document.getElementById("helpA"), chatPosEvent.target.value);
    });
    document.getElementById("età").addEventListener("change", (etaEvent) => {
        storyData["Info"][0] = etaEvent.target.value;
    });
    document.getElementById("nPers").addEventListener("change", (persEvent) => {
        storyData["Info"][1] = persEvent.target.value;
    });
    document.getElementById("descr").addEventListener("change", (descrEvent) => {
        storyData["Info"][2] = descrEvent.target.value;
    });

    document.getElementById("info").addEventListener("click", showInfo);
})

// Function to build dynamically interface =========================================================================================

function showInfo()
{
    var infoContainer = document.createElement("div");
    infoContainer.setAttribute("id", "info-container");
    var infoBox = document.createElement("div");
    infoBox.setAttribute("id", "info-box");
    var infoP = document.createElement("p");
    infoP.appendChild(document.createElement("b").appendChild(document.createTextNode("Ti diamo il benvenuto nella sezione autore di M&M!")));
    infoP.appendChild(document.createElement("br"));
    infoP.appendChild(document.createTextNode("Da quì, potrai creare la tua storia personalizzata e dalla sezione 'gestisci storie' pubblicarla."));
    infoP.appendChild(document.createElement("br"));
    infoP.appendChild(document.createTextNode("Questi sono dei suggerimenti per accompagnarti nella realizzazione della tua prima storia!"));
    infoP.appendChild(document.createElement("br"));
    infoP.appendChild(document.createTextNode("Una scena è un elemento di introduzione che andrebbe utilizzato per introdurre un nuovo contesto, una nuova attività o per enfatizzare l'ambiente in cui far immergere il tuo utente;"));
    infoP.appendChild(document.createElement("br"));
    infoP.appendChild(document.createTextNode("Pensi anche tu sia poco immersiva una storia raccontata in cui l'utente è parte passiva del tuo racconto? Utilizza con la massima creatività gli elementi attività. Essi ti permettono di mettere alla prova l'utente rendendolo parte attiva nella tua narrazione! Per quanto semplice non c'è niente di meglio di una piccola sfida per aguzzare le menti e per far apprendere informazioni!"));
    infoP.appendChild(document.createElement("br"));
    infoP.appendChild(document.createTextNode("******************************************"));
    infoP.appendChild(document.createElement("br"));
    infoP.appendChild(document.createTextNode("Informazioni tecniche :"));
    infoP.appendChild(document.createElement("br"));
    infoP.appendChild(document.createTextNode("Per caricare un video assicurati che sia in formato 'mp4' e che utilizzi una decodifica H264"));
    infoBox.appendChild(infoP);
    var hideInfo = document.createElement("div");
    hideInfo.setAttribute("id", "hide-info");
    hideInfo.addEventListener("click", () => {
        if(document.getElementById("info-container").style.display == "none")
        {
            document.getElementById("info-container").style.display = "flex";
        }
        else
        {
            document.getElementById("info-container").style.display = "none";
        }
    })
    infoBox.appendChild(hideInfo);
    infoContainer.appendChild(infoBox);
    document.body.replaceChild(infoContainer, document.getElementById("info-container"));
    infoContainer.style.display = "flex";

}

function add_scene()
{   
    resetSceneInfo();
    document.getElementById("skin-editor-and-story-info").style.display = "block";

    if(document.getElementById("story_name"))
    {
        if(document.getElementById("story_name").value.length > 0)
        {
            var h1 = document.createElement("h1");
            var storyname = document.getElementById("story_name").value;
            h1.appendChild(document.createTextNode(storyname));
            h1.setAttribute("id", "story-name")
            h1.style.color = "#d6d0d0";
            document.getElementById("scenes_editor").replaceChild(h1, document.getElementById("scenes_editor").lastChild);
        }
    }

    resetSceneForm();
    resetActivityForm(1);
    resetPreviews();
    updateStoryData();
    buildSceneORactivityFrame("scene");
}

function buildSceneORactivityFrame(frameType)
{
    document.getElementById("preview").style.display = "flex";
    document.getElementById("editor_form").style.display = "block";
    document.getElementById("formContainer").style.display = "flex";

    switch(frameType)
    {
        case "scene":

            //Aggiungo un elemento "scena" alla storia
            var ul_scenes = document.getElementById("scenes_list");
            var new_scene = document.createElement("li");
            new_scene.setAttribute("role", "button");
            var id_scene = "scena-" + c.toString();
            new_scene.setAttribute("id", id_scene);
            new_scene.setAttribute("class", "scene");
            current_scene = id_scene;
            document.getElementById("selected_scene").innerHTML = id_scene;
            var new_scene_content = document.createTextNode(id_scene);
            new_scene.appendChild(new_scene_content);
            var linked_scene = document.createElement("a");
            linked_scene.setAttribute("name", id_scene);
            linked_scene.addEventListener("click", loadScene);
            linked_scene.appendChild(new_scene);
            ul_scenes.appendChild(linked_scene);
            make_form("scene");
            c += 1;
            break;

        case "activity":

            //Aggiungo un elemento "attività" alla storia
            var ul_scenes = document.getElementById("scenes_list");
            var new_activity = document.createElement("li");
            new_activity.setAttribute("role", "button");
            var id_activity = "attività-" + a.toString();
            new_activity.setAttribute("id", id_activity);
            new_activity.setAttribute("class", "activity");
            current_scene = id_activity;
            document.getElementById("selected_scene").innerHTML = id_activity;
            var new_activity_content = document.createTextNode(id_activity);
            new_activity.appendChild(new_activity_content);
            var linked_scene = document.createElement("a");
            linked_scene.setAttribute("name", id_activity);
            linked_scene.addEventListener("click", loadScene);
            linked_scene.appendChild(new_activity);
            ul_scenes.appendChild(linked_scene);
            make_form("activity");
            a++;
            break;
        
        default:

            resetActivityForm(1);
            updateStoryData();
            document.getElementById("selected_scene").innerHTML = "Attività in caso di errore-" + (a - 1).toString();
            make_form("activity_error");
            break;
    }
}

//Crea i widgets associati al "form" per la manipolazione della scena/attività
function make_form(typeForm)
{
    var i;
    document.getElementById("formContainer").style.display = "flex";
    document.getElementById("editor_form").style.display = "block";

    if ((c == 0) && (a == 0))
    {
        var storyName = document.createElement("input");
        storyName.setAttribute("type", "input");
        storyName.setAttribute("id", "story_name");
        storyName.setAttribute("placeholder", "Titolo storia");
        document.getElementById("scenes_editor").appendChild(storyName);
    }

    var button_div = document.getElementById("button_container");
    var submit_button = document.createElement("input");
    submit_button.setAttribute("id", "submit_button");
    submit_button.setAttribute("type", "button");
    submit_button.setAttribute("value", "Salva storia");
    submit_button.addEventListener("click", saveStory);
    submit_button.style.marginTop = "50px";

    if (typeForm == "activity")
    {
        var create_activity = document.createElement("input");
        create_activity.setAttribute("id", "activity_error");
        create_activity.setAttribute("type", "button");
        create_activity.setAttribute("value", "Crea attività in caso di errore");
        create_activity.addEventListener("click", () => {
            resetSceneInfo();    
            resetSceneForm();
            resetPreviews();
            buildSceneORactivityFrame("activity-error");
            add_activity();
        });
        button_div.appendChild(create_activity);
    }

    button_div.appendChild(submit_button);

    //Contenitori dei box input
    var first_container = document.getElementById("first_container");
    var second_container = document.getElementById("second_container");

    //Definizione di un nuovo tag che conterrà i campi dati. Tale ulteriore indentazione è necessaria per eliminare dal display i form relativi alla scena precedente/cancellata
    var box_0 = document.createElement("div");
    box_0.setAttribute("id", "box_0");
    var box_1 = document.createElement("div");
    box_1.setAttribute("id", "box_1");

    var label_dict = { 0 : ["Colore sfondo", "coloreSfondo", "color"], 1 : ["Audio scena", "audio", "file"], 2 : ["Immagine di sfondo", "img", "file"], 
                       3 : ["Video di sfondo", "video", "file"], 4 : ["Testo scena", "testo", "textarea"],  5 : ["Colore testo: ", "coloreTesto", "color"], 
                       6 : ["Stile testo: ", "stileTesto", "select"], 7 : ["Dimensione testo", "pxTesto", "range"] };

    //TODO: convertire gli if a cascata in una struttura switch
    for (var i = 0; i < Object.keys(label_dict).length; i++)
    {   
        var input;
        var p = document.createElement("p");
        var p_text = document.createTextNode(label_dict[i][0])
        p.appendChild(p_text);

        if (i < 4)
        {
            var input = document.createElement("input");
            input.setAttribute("id", label_dict[i][1]);
            input.setAttribute("type", label_dict[i][2]);
            
            if(i == 1)
            {
                input.setAttribute("accept", ".mp3");
                input.setAttribute("name", "data");
            }
            if(i == 2)
            {
                input.setAttribute("accept", ".png, .jpg");
                input.setAttribute("name", "data");
            }
            if(i == 3)
            {
                input.setAttribute("accept", ".mp4");
                input.setAttribute("name", "data");
            }

            if(i == 0) 
            {
                input.addEventListener("change", updateCurrentScene);
            }
            else
            {
                input.addEventListener("change", file_upload);
            }
            
            box_0.appendChild(p);
            box_0.appendChild(input);
        }
        else
        {
            if(i == 6)
            {
                input = document.createElement(label_dict[i][2]);
                input.setAttribute("id", label_dict[i][1]);
                var stileTesto = ["Bold", "Bolder", "Lighter"];

                for(var n = 0; n < 3; n++)
                {
                    var option = document.createElement("option");
                    option.setAttribute("value", stileTesto[n]);
                    option.appendChild(document.createTextNode(stileTesto[n]));
                    input.appendChild(option);
                }
            }
            else
            {
                input = document.createElement("input");

                if(i == 7)
                {   
                    input.setAttribute("id", label_dict[i][1]);
                    input.setAttribute("type", label_dict[i][2]);
                    input.setAttribute("min", "10");
                    input.setAttribute("max", "80");
                }
                else
                {
                    input.setAttribute("id", label_dict[i][1]);
                    input.setAttribute("type", label_dict[i][2]);
                }
            }
            
            input.addEventListener("change", updateCurrentScene);
            box_1.appendChild(p);
            box_1.appendChild(input); 
        }
    }

    first_container.appendChild(box_0);
    second_container.appendChild(box_1);
    document.getElementById("formContainer").replaceChild(button_div, document.getElementById("button_container"));
        
    //Setto l'altezza del box in modo da far entrare correttamente i campi al suo interno
    first_container.style.width = "45%";
    second_container.style.width = "45%";
}

function createActivity(eventActivity)
{   
    document.getElementById("skin-editor-and-story-info").style.display = "block";

    if(document.getElementById("story_name"))
    {
        if(document.getElementById("story_name").value.length > 0)
        {
            var h1 = document.createElement("h1");
            var storyname = document.getElementById("story_name").value;
            h1.appendChild(document.createTextNode(storyname));
            h1.setAttribute("id", "story-name")
            h1.style.color = "#d6d0d0";
            document.getElementById("scenes_editor").replaceChild(h1, document.getElementById("scenes_editor").lastChild);
        }
    }

    resetSceneInfo();
    resetSceneForm();
    resetActivityForm(1);
    updateStoryData();
    add_activity();
    buildSceneORactivityFrame(eventActivity.target.id);}

function add_activity()
{
    resetPreviews();
    var answerP = document.createElement("p");
    answerP.appendChild(document.createTextNode("Quesito attività : "))
    var answerTXT = document.createElement("input");
    answerTXT.setAttribute("id", "answer");
    answerTXT.setAttribute("type", "text");
    answerTXT.addEventListener("change", (eventAnswer) => {
        sceneData["Tipologia attivita"][0] = eventAnswer.target.value;
    })
    answerP.appendChild(answerTXT);
    var pointP = document.createElement("p");
    var point = document.createElement("input");
    point.setAttribute("type", "number");
    point.setAttribute("id", "point");
    pointP.appendChild(document.createTextNode("Punteggio attività : "));
    pointP.appendChild(point);
    point.addEventListener("change", (eventPoint) => {
        sceneData["Tipologia attivita"][3] = eventPoint.target.value;
    })
    var selectText = document.createElement("p");
    selectText.appendChild(document.createTextNode("Tipologia di risposta accettata : "))
    var replySelect = document.createElement("select");
    replySelect.setAttribute("id", "activityType");
    replySelect.addEventListener("change", () => {
        sceneData["Tipologia attivita"][2] = [{"Risposta" : ""}, ], "", {"Attività errore" : {}};
        sceneData["Tipologia attivita"][1] = document.getElementById("activityType").value;
        var activity_container = document.getElementById("activity_container");
        var activity_prev = document.getElementById("activityPrev");

        if(activity_prev)
        { 
            try { activity_container.removeChild(activity_prev); }
            catch { document.getElementById("txtA").removeChild(activity_prev); }
        }
    
        var newSettings = document.createElement("div");
        newSettings.setAttribute("id", "activityPrev");
        newSettings.style.marginBottom = "20px";

        switch(document.getElementById("activityType").value)
        {
            case "Risposta multipla":
        
                var divOptions = document.createElement("div");
                divOptions.setAttribute("id", "divOptions");
                var inputP = document.createElement("p");
                inputP.appendChild(document.createTextNode("Inserire il numero di voci presenti nella scelta multipla : "))
                var input = document.createElement("input");
                input.setAttribute("id", "radioN");
                input.setAttribute("type", "number");
                input.addEventListener("change", setRadiosSettings);
                inputP.appendChild(input);
                divOptions.appendChild(inputP);
                divOptions.appendChild(input);
                divOptions.style.marginBottom = "20px";
                newSettings.appendChild(divOptions);
                activity_container.appendChild(newSettings);
                break;

            case "Selezione elemento":

                var div = document.createElement("div");
                div.setAttribute("id", "divSelection");
                var p = document.createElement("p");
                p.appendChild(document.createTextNode("Inserisci il numero totale degli elementi : "));
                var input = document.createElement("input");
                input.setAttribute("type", "number");
                p.appendChild(input);
                input.addEventListener("change", (selectionEvent) => {

                    var divSelection = document.createElement("div");
                    divSelection.setAttribute("id", "divSelection");
                    divSelection.style.marginBottom = "20px";
                    divSelection.appendChild(p);

                    for(var i = 0; i < selectionEvent.target.value; i++)
                    {   
                        var elem = document.createElement("input");
                        elem.setAttribute("type", "file");
                        elem.setAttribute("accept", ".png, .jpg");
                        elem.setAttribute("name", "data");
                        elem.setAttribute("id", "elemento-" + i.toString());
                        elem.addEventListener("change", file_upload);

                        if(i == 0)
                        {
                            var correct = document.createElement("p");
                            correct.appendChild(document.createTextNode("Carica quì l'elemento corretto da selezionare : "));
                            correct.appendChild(elem);
                            divSelection.appendChild(correct);
                        }
                        else
                        {
                            var tmp = document.createElement("p");
                            tmp.appendChild(document.createTextNode("Elemento " + i.toString() + " : "));
                            tmp.appendChild(elem);
                            divSelection.appendChild(tmp);
                        }
                    }

                    newSettings.replaceChild(divSelection, document.getElementById("divSelection"));
                });

                div.appendChild(p);
                newSettings.appendChild(div);
                activity_container.appendChild(newSettings);
                break;

            case "Selezione ordinata":

                var div = document.createElement("div");
                div.setAttribute("id", "divOptions");
                var p = document.createElement("p");
                p.appendChild(document.createTextNode("Inserisci il numero totale degli elementi : "));
                var input = document.createElement("input");
                input.setAttribute("type", "number");
                p.appendChild(input);
                input.addEventListener("change", (selectionEvent) => {

                    var div = document.createElement("div");
                    div.setAttribute("id", "divOptions");

                    for(var i = 0; i < selectionEvent.target.value; i++)
                    {
                        var cont = document.createElement("div");
                        var elem = document.createElement("input");
                        elem.setAttribute("id", "sortable-" + i.toString());
                        elem.setAttribute("type", "file");
                        elem.setAttribute("accept", ".png, .jpg");
                        elem.setAttribute("name", "data");
                        elem.addEventListener("change", file_upload);
                        cont.appendChild(elem);
                        div.appendChild(cont);
                    }

                    newSettings.replaceChild(div, document.getElementById("divOptions"));
                });
                newSettings.appendChild(p);
                newSettings.appendChild(div);
                activity_container.appendChild(newSettings);
                break;
            
            default:
       
                sceneData["Tipologia attivita"][0] = "";
                break;    
        }
    });
    
    var replyTypes = ["", "Testo libero", "Risposta multipla", "Caricamento file", "Selezione elemento", "Selezione ordinata"];
    
    for(var n = 0; n < replyTypes.length; n++)
    {
        var option = document.createElement("option");
        option.setAttribute("value", replyTypes[n]);
        option.appendChild(document.createTextNode(replyTypes[n]));
        replySelect.appendChild(option);
    }
    
    var activity_container = document.getElementById("activity_container");
    activity_container.style.display = "block";
    selectText.appendChild(replySelect);
    activity_container.appendChild(answerP);
    activity_container.appendChild(pointP);
    activity_container.appendChild(selectText);
    document.getElementById("editor_form").style.display = "block";
} 
    
function setRadiosSettings(selectEvent)
{
    var divOptions = document.getElementById("divOptions");
    var oldFieldN = divOptions.getElementsByClassName("radioChoose").length;

    for(var i = (selectEvent.target.value * 2); i < oldFieldN; i++)
    {   
        divOptions.removeChild(divOptions.lastChild);
    }

    for(var i = (oldFieldN / 2).toFixed(0); i < selectEvent.target.value; i++)
    {
        var optionP = document.createElement("p");

        if( i == 0 )
        {
            optionP.appendChild(document.createTextNode("Inserisci il testo della checkbox n. " + i.toString() + " rappresentante la risposta corretta : "));
        }
        else
        {
            optionP.appendChild(document.createTextNode("Inserisci il testo della checkbox n. " + i.toString() + " : "));
        }

        optionP.setAttribute("class", "radioChoose");
        var input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("class", "radioChoose");
        divOptions.appendChild(optionP);
        divOptions.appendChild(input);
    }
}

function buildUploadedStory()
{
    while(document.getElementById("scenes_list").hasChildNodes())
    {
        document.getElementById("scenes_list").removeChild(document.getElementById("scenes_list").lastChild);
    }

    document.getElementById("scenes_editor").removeChild(document.getElementById("scenes_editor").lastChild);

    Object.keys(storyData).forEach(key => {

        if(key !== "Info")
        {
            if(key !== "Skin")
            {
                resetSceneInfo();
                resetActivityForm(1);
                resetSceneForm();
                resetPreviews();
                sceneData = storyData[key];
    
                if(key.substr(0, 5) == "scena")
                {
                    buildSceneORactivityFrame("scene");
                }
                else
                {
                    buildSceneORactivityFrame("activity");
                }
            }
            else
            {   
                for(var i = 0; i < storyData["Skin"].length; i++)
                {
                    if(storyData["Skin"][i] !== "")
                    {
                        switch(i.toString())
                        {
                            case "0":
                                document.getElementById("chatA").style.backgroundImage = "url(../uploaded_data/files/" + storyData["Skin"][i] + ")";
                                document.getElementById("chatB").style.backgroundImage = "url(../uploaded_data/files/" + storyData["Skin"][i] + ")";
                                break;
                    
                            case "1":
                                movingChatORhelp(document.getElementById("chatA"), storyData["Skin"][i]);
                                movingChatORhelp(document.getElementById("chatB"), storyData["Skin"][i]);
                                break;
                            
                            case "2":
                                document.getElementById("helpA").style.backgroundImage = "url(../uploaded_data/files/" + storyData["Skin"][2] + ")";
                                document.getElementById("helpB").style.backgroundImage = "url(../uploaded_data/files/" + storyData["Skin"][2] + ")";
                            
                            case "3":
    
                                movingChatORhelp(document.getElementById("helpA"), storyData["Skin"][i]);
                                movingChatORhelp(document.getElementById("helpB"), storyData["Skin"][i]);
                                break;
                            
                            case "4":
    
                                let tmpA = document.getElementById("txtA");
                                tmpA.style.backgroundColor = "none";
                                tmpA.style.border = "none";
                                tmpA.style.borderRadius = "0px";
                                tmpA.style.backgroundImage = "url(../uploaded_data/files/" + storyData["Skin"][i] + ")";
                                let tmpB = document.getElementById("txtB");
                                tmpB.style.backgroundColor = "none";
                                tmpB.style.border = "none";
                                tmpB.style.borderRadius = "0px";
                                tmpB.style.backgroundImage = "url(../uploaded_data/files/" + storyData["Skin"][i] + ")";
                        }
                    }
                }
            }
        }
    });

    if(sceneData["Tipologia attivita"][4]["Attività errore"].hasOwnProperty("Testo scena"))
    {
        loadFrameData(sceneData, 1);
    }
    else
    {
        loadFrameData(sceneData, 0);
    }

    document.getElementById("data_stored").style.display = "block";
    document.getElementById("skin-editor-and-story-info").style.display = "block";
    updateOldScene(sceneData);
}

// Cleaning functions =========================================================================================

//Elimina i campi form della scena in esame
function resetSceneForm()
{   
    if(document.getElementById("box_0"))
    {
        var button_container = document.getElementById("button_container");
        while(button_container.hasChildNodes()) { button_container.removeChild(button_container.lastChild); }
        var first_container = document.getElementById("first_container");
        var second_container = document.getElementById("second_container");
        var box_0 = document.getElementById("box_0");
        var box_1 = document.getElementById("box_1");
        first_container.removeChild(box_0);
        second_container.removeChild(box_1);
        var scenes_editor = document.getElementById("scenes_editor");
        if(document.getElementById("name")) { scenes_editor.removeChild(document.getElementById("name")); }

        //Setto il parametro height di first_container e second_container al 100% per evitare 
        //la visualizzazione del background-color in assenza di form
        first_container.style.height = "100%";
        second_container.style.height = "100%";
    }
}

function resetSceneInfo()
{
    var node = document.getElementById("oldData_list");

    if(document.getElementById("oldData_list").hasChildNodes())
    {
        var container = document.getElementById("data_stored");
        container.removeChild(node);
        var ul = document.createElement("ul");
        ul.setAttribute("id", "oldData_list");
        container.appendChild(ul);
    }

    document.getElementById("data_stored").style.display = "none";
}

function resetPreviews()
{
    if(document.getElementById("video_previewA"))
    {
        document.getElementById("video_playerA").pause();
        document.getElementById("video_playerB").pause();
    }
    var preview_container = document.getElementById("preview_container");
    var preview_viewerA = document.createElement("div");
    preview_viewerA.setAttribute("id", "preview_viewerA");
    var preview_viewerB = document.createElement("div");
    preview_viewerB.setAttribute("id", "preview_viewerB");
    document.getElementById("text_previewA").innerHTML = "";
    document.getElementById("text_previewB").innerHTML = "";
    preview_viewerA.appendChild(document.getElementById("chatA"));
    preview_viewerA.appendChild(document.getElementById("helpA"));
    preview_viewerA.appendChild(document.getElementById("txtA"));
    preview_viewerB.appendChild(document.getElementById("chatB"));
    preview_viewerB.appendChild(document.getElementById("helpB"));
    preview_viewerB.appendChild(document.getElementById("txtB"));
    preview_viewerA.addEventListener("click", switchText);
    preview_viewerB.addEventListener("click", switchText);
    var video_playerA = document.createElement("video");
    video_playerA.setAttribute("id", "video_playerA");
    video_playerA.setAttribute("class", "video_preview");
    video_playerA.setAttribute("type", "video/mp4");
    video_playerA.setAttribute("controls", "controls");
    video_playerA.style.display = "none";
    var video_playerB = document.createElement("video");
    video_playerB.setAttribute("id", "video_playerB");
    video_playerB.setAttribute("class", "video_preview");
    video_playerB.setAttribute("type", "video/mp4");
    video_playerB.setAttribute("controls", "controls");
    video_playerB.style.display = "none";
    preview_viewerA.appendChild(video_playerA);
    preview_viewerB.appendChild(video_playerB);
    preview_container.replaceChild(preview_viewerA, document.getElementById("preview_viewerA"));
    preview_container.replaceChild(preview_viewerB, document.getElementById("preview_viewerB"));
}

function resetActivityForm(flag)
{
    var activity_container = document.getElementById("activity_container");
    var radioChooseList = document.getElementsByClassName("radioChoose");

    for(var i = 1; i < radioChooseList.length; i += 2)
    {
        if (i == 1) 
        { 
            sceneData["Tipologia attivita"][2][0]["Risposta"] = radioChooseList[i].value;
        }
        else
        {
            sceneData["Tipologia attivita"][2].push(radioChooseList[i].value);
        }
    }

    if(flag)
    {
        while(activity_container.hasChildNodes())
        {
            activity_container.removeChild(activity_container.lastChild);
        }
    }
}

// Update old/current preview =========================================================================================

//Update the current scene container with new data inserted by the user
function updateCurrentScene(eventNode)
{
    var newData = eventNode.target.value;
    var currentPreview = document.getElementById("preview_viewerA");

    switch(eventNode.target.id)
    {  
        case "coloreSfondo":

            sceneData["Colore sfondo"] = newData;
            currentPreview.style.backgroundColor = newData;
            break;

        case "img":
        
            currentPreview.style.backgroundSize = "contain";
            currentPreview.style.backgroundImage = "url(../uploaded_data/files/" + sceneData["Sfondo scena"] + ")";
            break;

        case "audio":

            var audio = new Audio("../uploaded_data/files/" + sceneData["Audio scena"]);
            audio.play();
            break;
        
        case "video":

            document.getElementsByClassName("video_preview")[0].style.display = "block";
            var video = document.getElementById("video_playerA");
            video.pause();
            video.setAttribute("src", "../uploaded_data/files/" + sceneData["Video scena"]);
            video.load();
            video.play();
            break;
        
        case "testo":
        
            sceneData["Testo scena"][0] = newData;
            var p = document.createElement("p");
            p.setAttribute("id", "text_previewA");
            p.appendChild(document.createTextNode(newData));
            document.getElementById("txtA").replaceChild(p, document.getElementById("text_previewA"));
            break;
        
        case "coloreTesto":

            sceneData["Testo scena"][1] = newData;
            var currentText = document.getElementById("txtA");
            currentText.style.color = newData;
            break;
        
        case "stileTesto":

            sceneData["Testo scena"][2] = newData;
            var currentText = document.getElementById("txtA");
            currentText.style.fontWeight = newData;
            break;
        
        case "pxTesto":

            sceneData["Testo scena"][3] = newData;
            var currentText = document.getElementById("txtA");
            currentText.style.fontSize = newData + "px";
            break;
        
        case "chatSkin":

            document.getElementById("chatA").style.backgroundImage = "url(../uploaded_data/files/" + storyData["Skin"][0] + ")";
            break;

        case "helpSkin":

            document.getElementById("helpA").style.backgroundImage = "url(../uploaded_data/files/" + storyData["Skin"][2] + ")";
            break;
        
        case "textSkin":

            let tmpA = document.getElementById("txtA");
            tmpA.style.backgroundColor = "none";
            tmpA.style.border = "none";
            tmpA.style.borderRadius = "0px";
            tmpA.style.backgroundImage = "url(../uploaded_data/files/" + storyData["Skin"][4] + ")";
    }
}

function movingChatORhelp(node, pos)
{
    switch (pos) 
    {
        case "Angolo in alto a sinistra":
            
            node.style.top = "10px";
            node.style.left = "10px";     
            node.style.right = "unset";
            node.style.bottom = "unset";
            break;
    
        case "Angolo in alto a destra":
            
            node.style.top = "10px";
            node.style.right = "10px";
            node.style.left = "unset";
            node.style.bottom = "unset";
            break;

        case "Angolo in basso a destra":
            
            node.style.top = "unset";
            node.style.left = "unset";
            node.style.right = "10px";
            node.style.bottom = "10px";
            break;
        
        case "Angolo in basso a sinistra":
         
            node.style.top = "unset";
            node.style.right = "unset";
            node.style.left = "10px";
            node.style.bottom = "10px";
            break;
        
        default:

            break;
    }
}

//Update the old preview container with the old data saved
function updateOldScene(oldSceneData)
{
    var oldPreview = document.getElementById("preview_viewerB");

    Object.keys(oldSceneData).forEach(key => {

        if(oldSceneData[key].length > 0)
        {   
            switch(key)
            {
                case "Colore sfondo":
    
                    oldPreview.style.backgroundColor = oldSceneData["Colore sfondo"];
                    break;
                
                case "Sfondo scena":
    
                    oldPreview.style.backgroundSize = "contain";
                    oldPreview.style.backgroundImage = "url(../uploaded_data/files/" + oldSceneData["Sfondo scena"] + ")";
                    break;
                
                //TODO: Ha senso avviare la musica qualora venga caricata?
                case "Audio scena":

                    var audio = new Audio("../uploaded_data/files/" + oldSceneData["Audio scena"]);
                    audio.play();
                    break;
            
                case "Video scena":

                    document.getElementsByClassName("video_preview")[1].style.display = "block";
                    var video = document.getElementById("video_playerB");
                    video.pause();
                    video.setAttribute("src", "../uploaded_data/files/" + oldSceneData["Video scena"]);
                    video.load();
                    video.play();
                    break;
    
                case "Testo scena":
    
                    var p = document.createElement("p");
                    p.setAttribute("id", "text_previewB");
                    p.appendChild(document.createTextNode(oldSceneData["Testo scena"][0]));
                    p.style.color = oldSceneData["Testo scena"][1];
                    p.style.fontWeight = oldSceneData["Testo scena"][2];
                    p.style.fontSize = oldSceneData["Testo scena"][3] + "px";
                    document.getElementById("txtB").replaceChild(p, document.getElementById("text_previewB"));
                    break;
            }
        }
    });
}

//Abilita/disabilita la visualizzazione dell'elemento con tag " 'txt' + tmp "
function switchText(eventNode)
{
    switch(eventNode.target.id)
    {
        case "preview_viewerA":

            if(document.getElementById("txtA").style.display == "none")
            {
                document.getElementById("txtA").style.display = "block";
            }
            else
            {
                document.getElementById("txtA").style.display = "none";
            }
            break;
        
        case "preview_viewerB":

            if(document.getElementById("txtB").style.display == "none")
            {
                document.getElementById("txtB").style.display = "block";
            }
            else
            {
                document.getElementById("txtB").style.display = "none";
            }
            break;            
    }
}

// Utils function =========================================================================================================

function updateStoryData()
{
    if((a > 0) || (c > 0))
    {
        if(document.getElementById("selected_scene").innerHTML == "Attività in caso di errore-" + (a - 1).toString())
        {   
            checkNewData(sceneData, 1);
        }
        else
        {
            checkNewData(sceneData, 0);
        }
    }
    sceneData = {"Testo scena" : ["", "", "", ""], "Audio scena" : "", "Sfondo scena" : "", "Video scena" : "", "Colore sfondo" : "", "Tipologia attivita" : ["", "", [{"Risposta" : ""}, ], "", {"Attività errore" : {}}]};
}

function checkNewData(newData, subAct)
{   
    if(subAct)
    {   
        tmp = "attività-" + (a - 1).toString();
        var firstActAndErrAct = storyData[tmp]
        Object.keys(newData).forEach(key => { if (firstActAndErrAct["Tipologia attivita"][4]["Attività errore"][key] != newData[key]) { firstActAndErrAct["Tipologia attivita"][4]["Attività errore"][key] = newData[key] }; });
        storyData[tmp] = firstActAndErrAct;
    }
    else
    {
        if (storyData[current_scene]) 
        { 
            var tmp = storyData[current_scene];
            Object.keys(newData).forEach(key => { 

                    if ((typeof newData[key] == "string") && (newData[key] !== ""))
                    {
                        tmp[key] = newData[key];
                    }
                    if((typeof newData[key] == "object"))
                    {
                        for (let i = 0; i < newData[key].length; i++) 
                        {
                           if(i != 4)
                           {
                                if((typeof newData[key][i] == "string") && (newData[key][i] !== ""))
                                {
                                    tmp[key][i] = newData[key][i];
                                }
                                if(typeof newData[key][i] == "object")
                                {
                                    for(let x = 0; x < newData[key][i].length; x++)
                                    {
                                        if(newData[key][i][x] !== "")
                                        {
                                            tmp[key][i][x] = newData[key][i][x];
                                        }
                                    }
                                }
                           }
                        }
                    }
            });
            storyData[current_scene] = tmp;
        }
        else
        {
            storyData[current_scene] = newData;
        }
    }
}

//TODO: modifica della funzione per supportare le nuove modifiche alla nuova struttura delle attività
//Carica i dati della scena selezionata e procede al salvataggio dei dati della scena che si sta lasciando
function loadScene(loadingEvent)
{
    var selected_scene = loadingEvent.target.id;

    if(selected_scene != current_scene)
    {
        resetSceneInfo();
        resetActivityForm(1);
        updateStoryData();
        var data = storyData[selected_scene];
        var activityErrFlag = 0;

        if(data["Tipologia attivita"][4]["Attività errore"].hasOwnProperty("Testo scena"))
        {
            activityErrFlag = 1;
        }

        loadFrameData(data, activityErrFlag)
        resetSceneForm();
        resetPreviews();
        updateOldScene(storyData[selected_scene]);

        if(selected_scene.substr(0, 8) == "attività")
        {
            add_activity();
            make_form("activity");
        }
        else
        {
            make_form("scene");
        }

        document.getElementById("selected_scene").innerHTML = selected_scene;
        current_scene = selected_scene;
        document.getElementById("formContainer").style.display = "flex";

        if(!document.getElementById("oldData_list").hasChildNodes())
        {
            var li_box = document.createElement("li");
            var li_txt = document.createElement("b");
            li_txt.appendChild(document.createTextNode("Non esistono dati per la scena selezionata"));
            li_box.appendChild(li_txt);
            oldData_list.appendChild(li_box);
        }

        document.getElementById("data_stored").style.display = "block"
        document.getElementById("preview").style.display = "flex";
    }
}

function loadFrameData(dataObj, flag)
{
    var oldData_list = document.getElementById("oldData_list");

    Object.keys(dataObj).forEach(key => {

        var li_box = document.createElement("li");
        var li_key = document.createElement("b");
        li_key.appendChild(document.createTextNode(key + " : "));

        if(flag)
        {   
            sceneData[key] = dataObj[key];
        }

        if (((typeof dataObj[key] == "string") && (dataObj[key] !== "")) || ((typeof dataObj[key] == "object") && ((dataObj[key][0] !== "") || (dataObj[key][1] !== ""))))
        {   
            if((key == "Sfondo scena") || (key === "Video scena") || (key === "Audio scena"))
            {
                var li_txt = document.createTextNode("' " + dataObj[key].substr(0, dataObj[key].length - 18) + dataObj[key].substr(dataObj[key].length - 4) + " '");
                li_box.appendChild(li_key);
                li_box.appendChild(li_txt);
                oldData_list.appendChild(li_box);
            }
            else
            {    
                if(key == "Testo scena")
                {
                    li_box.appendChild(li_key);
                    li_box.appendChild(document.createTextNode("' " + dataObj[key][0] + " '"));
                    oldData_list.appendChild(li_box);

                    var tmp = ["", "Colore testo : ", "Stile testo : ", "Dimensione testo (px) : "];

                    for(var i = 1; i < dataObj[key].length; i++)
                    {
                        var li = document.createElement("li");
                        var b = document.createElement("b");
                        b.appendChild(document.createTextNode(tmp[i]));
                        var textInfo = document.createTextNode("' " + dataObj[key][i] + " '");
                        li.appendChild(b);
                        li.appendChild(textInfo);
                        oldData_list.appendChild(li);
                    }
                }
                else
                {
                    if(key == "Tipologia attivita")
                    {
                        var tmp = ["Quesito attività : ", "Tipologia domanda : ", ["- Risposta multipla n : ", " - Elemento n : "], "Punti quesito : "];

                        for(var i = 0; i < dataObj[key].length; i++)
                        {   
                            if(i < 2 || i == 3)
                            {
                                var li = document.createElement("li");
                                var b = document.createElement("b");
                                b.appendChild(document.createTextNode(tmp[i]));
                                var textInfo;
                                textInfo = document.createTextNode("' " + dataObj[key][i] + " '");
                                li.appendChild(b);
                                li.appendChild(textInfo);
                                oldData_list.appendChild(li);
                            }
                            else
                            {
                                if((i == 2) && ((dataObj[key][1] == "Risposta multipla") || (dataObj[key][1] == "Selezione elemento") || (dataObj[key][1] == "Ordinare elementi")))
                                {
                                    for(var n = 0; n < dataObj[key][2].length; n++)
                                    {
                                        var li = document.createElement("li");
                                        var p = document.createElement("p");
                                        if(n != 0)
                                        {
                                            if (dataObj[key][1] == "Risposta multipla")
                                            {
                                                p.appendChild(document.createTextNode(tmp[i][0] + n.toString() + " -> " + dataObj[key][2][n]));
                                            }
                                            else
                                            {
                                                p.appendChild(document.createTextNode(tmp[i][1] + n.toString() + " -> " + dataObj[key][2][n]));
                                            }
                                        }
                                        else
                                        {
                                            if (dataObj[key][1] == "Risposta multipla")
                                            {
                                                p.appendChild(document.createTextNode(tmp[i][0] + n.toString() + " -> " + dataObj[key][2][0]["Risposta"]));
                                            }
                                            if (dataObj[key][1] == "Selezione elemento")
                                            {
                                                p.appendChild(document.createTextNode(tmp[i][1] + n.toString() + " -> " + dataObj[key][2][0]["Risposta"]));
                                            }
                                        }
                                        li.appendChild(p);
                                        li.style.listStyleType = "none";
                                        oldData_list.appendChild(li);
                                    }
                                }
                                else
                                {
                                    if((i == 4) && flag)
                                    {
                                        var li = document.createElement("li");
                                        var p = document.createElement("p");
                                        p.appendChild(document.createTextNode("********************************************"));
                                        var h3 = document.createElement("h3");
                                        h3.appendChild(document.createTextNode("Informazioni attività in caso di errore"));
                                        li.appendChild(p);
                                        li.appendChild(h3);
                                        li.style.listStyleType = "none";
                                        oldData_list.appendChild(li);
                                        loadFrameData(dataObj[key][i]["Attività errore"], 0);
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        var li_txt = document.createTextNode("' " + dataObj[key] + " '");
                        li_box.appendChild(li_key);
                        li_box.appendChild(li_txt);
                        oldData_list.appendChild(li_box);
                    }
                }
            }
        }
    });
}

//Procede al caricamento asincrono del file verso il server
function file_upload(eventNode)
{
    //Creo un form contenente il file che l'utente vuole caricare
    var form = document.createElement("form");
    form.appendChild((eventNode.target).cloneNode(true));

    //Procedo all'inoltro del file, mediante un FormData, in via asincrona 
    var formData = new FormData(form);

    $.ajax(
    {
        type: "post",
        url: "/uploadfile",
        data: formData,
        contentType: false, 
        processData: false, 
        success: function(fileName)
        {   
            setFileOfScene(eventNode.target.id, fileName);
            updateCurrentScene(eventNode);
            //setto l'attributo "alt" del nodo originale per segnalare il caricamento positivo del file
            eventNode.target.setAttribute("alt", "Upload completed");
        },
        error: function (err)
        {
            console.log("Salvataggio file non completato");
            alert("Il caricamento di un file non e' andato a buon termine.\nSi consiglia di riprovare a selezionare il file");
        }
    }); 
    event.preventDefault();
}

function setFileOfScene(nodeID, storedName)
{
    switch (nodeID) 
    {
        case "audio":
            
            sceneData["Audio scena"] = storedName;
            break;
    
        case "img":

            sceneData["Sfondo scena"] = storedName;
            break;

        case "video":

            sceneData["Video scena"] = storedName;
            break;

        case "chatSkin":
                        
            storyData["Skin"][0] = storedName;
            break;
        
        case "helpSkin":

            storyData["Skin"][2] = storedName;
            break;
            
        case "textSkin":

            storyData["Skin"][4] = storedName;
            break;
    }
    
    if(nodeID.substr(0, 8) == "elemento")
    {
        if(nodeID.substr(9) === "0") 
        { 
            sceneData["Tipologia attivita"][2][0]["Risposta"] = storedName; 
        }
        else
        {
            sceneData["Tipologia attivita"][2].push(storedName);
        }
        var br = document.createElement("br");
        var parent = document.getElementById(nodeID).parentNode;
        var inputInfo = document.createElement("input");
        inputInfo.setAttribute("type", "file");
        inputInfo.setAttribute("name", storedName);
        inputInfo.setAttribute("accept", ".txt");
        inputInfo.addEventListener("change", uploadTXT);
        var p = document.createElement("p");
        p.appendChild(document.createTextNode("Inserire un file 'txt' di descrizione dell'immagine antecedente (" + nodeID + "). Qualora l'immagine venga cambiata, si prega di ricaricare il file : "));
        parent.appendChild(br);
        p.appendChild(inputInfo);
        parent.appendChild(p);
    }
    else
    {
        if(nodeID.substr(0, 8) == "sortable")
        {
            sceneData["Tipologia attivita"][2].push(storedName);
            var br = document.createElement("br");
            var parent = document.getElementById(nodeID).parentNode;
            var inputInfo = document.createElement("input");
            inputInfo.setAttribute("type", "file");
            inputInfo.setAttribute("name", storedName);
            inputInfo.setAttribute("accept", ".txt");
            inputInfo.addEventListener("change", uploadTXT);
            var p = document.createElement("p");
            p.appendChild(document.createTextNode("Inserire un file 'txt' di descrizione dell'immagine antecedente. Qualora l'immagine venga cambiata, si prega di ricaricare il file : "));
            parent.appendChild(br);
            p.appendChild(inputInfo);
            parent.appendChild(p);
        }
    }
}

function uploadTXT(eventTXT)
{
    var name = eventTXT.target.getAttribute("name");
    var file = eventTXT.target.files[0];
    var reader = new FileReader();
    reader.onload = (data) => {
        var dataString = data.target.result;
        $.ajax(
        {
            type: "post",
            url: "/saveImgDescription",
            data: {"nome" : name, "data" : dataString}
        });
    };
    reader.readAsText(file);
}

function getStory()
{
    let aTmp = 0;
    let cTmp = 0;
    var sortedStory = {"Info" : storyData["Info"], "Skin" : storyData["Skin"]};

    for(node of document.getElementById("scenes_list").childNodes)
    {
        let type = node.getAttribute("name").substr(0, 9);

        if(type == "attività-")
        {
            sortedStory[type + aTmp.toString()] = storyData[node.getAttribute("name")];
            aTmp++;
        }
        else
        {
            sortedStory["scena-" + cTmp.toString()] = storyData[node.getAttribute("name")];
            cTmp++;
        }
    }

    return sortedStory
}

function saveStory()
{
    if(document.getElementById("story-name"))
    {
        sendTOserver(document.getElementById("story-name").innerHTML);
    }
    else
    {
        if(document.getElementById("story_name").value.length > 0)
        {
            var h1 = document.createElement("h1");
            var storyname = document.getElementById("story_name").value;
            h1.appendChild(document.createTextNode(storyname));
            h1.setAttribute("id", "story-name")
            h1.style.color = "#d6d0d0";
            document.getElementById("scenes_editor").replaceChild(h1, document.getElementById("scenes_editor").lastChild);
            saveStory();
        }
        else
        {
            alert("Si prega di inserire il nome della storia prima di procedere al salvataggio")
        }
    }
}

function sendTOserver(name)
{
    var story = getStory();
    var storyTOsave = {"nome" : name, "dati" : JSON.stringify(story, null, 2)};
    $.ajax(
    {
        type: "post",
        url: "/saveStory",
        data: storyTOsave,
        success: function(savedStory)
        {   
            alert("La storia ' " + savedStory + " ' è stata correttamente salvata");
        },
        error: function (err)
        {
            alert("Salvataggio storia non completato");
        }
    });
}