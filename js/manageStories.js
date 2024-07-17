$(() => { getStories(); })

function getStories()
{
    $.ajax(
        {
            type: "get",
            url: "/getStories",
            success: function(savedStories)
            {   
                loadStories(savedStories);
            },
            error: function (err)
            {
                alert("Si è verificato un errore nella richiesta delle storie caricate, si prega di riprovare");
            }
        });
}

function loadStories(stories)
{
    clearStoriesTable();

    var uploadedStories = JSON.parse(stories)["stories"];

    if(uploadedStories.length > 0)
    {   
        document.getElementById("msg").style.display = "none";
        var table = document.getElementById("uploaded_stories")
        var thead = document.createElement("thead")
        var trH = document.createElement("tr");
        var thA = document.createElement("th");
        var thB = document.createElement("th");
        var thC = document.createElement("th");
        var thD = document.createElement("th");
        var thE = document.createElement("th");
        var thF = document.createElement("th");
        thA.appendChild(document.createTextNode("Nome storia"));
        thB.appendChild(document.createTextNode("Pubblica storia"));
        thC.appendChild(document.createTextNode("Duplica storia"));
        thD.appendChild(document.createTextNode("Elimina storia"));
        thE.appendChild(document.createTextNode("Ritira storia"));
        thF.appendChild(document.createTextNode("Download storia"));
        trH.appendChild(thA);
        trH.appendChild(thB);
        trH.appendChild(thC);
        trH.appendChild(thD);
        trH.appendChild(thE);
        trH.appendChild(thF);
        thead.appendChild(trH);
        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        
            
        for(story of uploadedStories)
        {
            var tr = document.createElement("tr");
            var tdA = document.createElement("td");
            var tdB = document.createElement("td");
            var tdC = document.createElement("td");
            var tdD = document.createElement("td");
            var tdE = document.createElement("td");
            var tdF = document.createElement("td");
            tdA.appendChild(document.createTextNode(story));
            var pub = document.createElement("div");
            pub.setAttribute("class", "publish");
            pub.addEventListener("click", publishStory);
            tdB.appendChild(pub);
            var dup = document.createElement("div");
            dup.setAttribute("class", "duplicate");
            dup.addEventListener("click", duplicateStory);
            tdC.appendChild(dup);
            var del = document.createElement("div");
            del.setAttribute("class", "delete");
            del.addEventListener("click", deleteStory);
            tdD.appendChild(del);
            var noPub = document.createElement("div");
            noPub.setAttribute("class", "nopublish");
            noPub.addEventListener("click", removePublish);
            tdE.appendChild(noPub);
            var download = document.createElement("div");
            download.setAttribute("class", "download");
            download.addEventListener("click", downloadStory);
            tdF.appendChild(download);
            tr.appendChild(tdA);
            tr.appendChild(tdB);
            tr.appendChild(tdC);
            tr.appendChild(tdD);
            tr.appendChild(tdE);
            tr.appendChild(tdF);
            tbody.appendChild(tr);
        }

        table.appendChild(tbody)
    }
    else
    {
        document.getElementById("msg").style.display = "block";
        document.getElementById("qrcode-container").style.display = "none";
    }
}

function clearStoriesTable()
{
    var table = document.createElement("table");
    table.setAttribute("id", "uploaded_stories");
    table.setAttribute("class", "content-table");
    document.getElementById("table-container").replaceChild(table, document.getElementById("uploaded_stories"));
}

function publishStory(publishEvent)
{
    var story_name = publishEvent.target.parentNode.parentNode.firstChild.firstChild.data;
    
    $.ajax(
    {
        type: "post",
        url: "/publishStory",
        data: {"nome" : story_name},
        success: function(welcomePage)
        {
            console.log(welcomePage);
            makeQR(welcomePage, story_name);
        },
        error: (err) => { console.log(err); }     
    });
}

function duplicateStory(duplicateEvent)
{
    var story_name = duplicateEvent.target.parentNode.parentNode.firstChild.firstChild.data;

    $.ajax(
    {
        type: "post",
        url: "/duplicateStory",
        data: {"nome" : story_name},
        success: function()
        {
            getStories();
        },
        error: (err) => { console.log(err); }     
    });
}

function deleteStory(deleteEvent)
{
    var story_name = deleteEvent.target.parentNode.parentNode.firstChild.firstChild.data;

    $.ajax(
    {
        type: "post",
        url: "/deleteStory",
        data: {"nome" : story_name},
        success: function()
        {
            getStories();
        },
        error: (err) => { console.log(err); }     
    });
}

function removePublish(remPublishEvent)
{
    var story_name = remPublishEvent.target.parentNode.parentNode.firstChild.firstChild.data;
    
    $.ajax(
    {
        type: "post",
        url: "/noPublish",
        data: {"nome" : story_name},
        error: (err) => { console.log(err); }
    });
}

function downloadStory(downloadEvent)
{
    var story_name = downloadEvent.target.parentNode.parentNode.firstChild.firstChild.data;

    $.ajax(
    {
        type: "post",
        url: "/getStory",
        data: {"nome" : story_name},
        success: function(storyData)
        {
            var file = new Blob([JSON.stringify(JSON.parse(storyData)["story"], null, 2)], {type: "application/json"});
            saveAs(file, story_name);
        },
        error: (err) => { console.log(err); }
    });
}

function makeQR(storage_name, storyName)
{
    var qrContainer = document.createElement("div");
    qrContainer.setAttribute("id", "qrcode-container");
    document.body.replaceChild(qrContainer, document.getElementById("qrcode-container"));
    var QRcode = new QRCode(document.getElementById("qrcode-container"), storage_name);
    html2canvas(document.querySelector("#qrcode-container"), { ignoreElements: function (node) { return node.nodeName === 'IMG' }}).then((canvas) => { saveQR(canvas.toDataURL(), storyName + "-qrcode.png"); });
}

function saveQR(uri, filename) {

    var link = document.createElement('a');

    if (typeof link.download === 'string')
    {
        link.href = uri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } 
    else 
    {
        window.open(uri);
    }
}