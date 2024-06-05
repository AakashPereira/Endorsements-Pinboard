import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://upskilling-8ad93-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementsInDB = ref(database, "endorsements")

const endorsementInput = document.getElementById("endorsement-input")
const fromInput = document.getElementById("from-input")
const toInput = document.getElementById("to-input")

const publishBtn = document.getElementById("publish-btn")

const statusMsg = document.getElementById("status-msg")

const endorsementsContainer = document.getElementById("endorsements-container")

publishBtn.addEventListener("click", function() {
    const endorsementComment = endorsementInput.value
    const fromUser = fromInput.value
    const toUser = toInput.value
    
    validateForm(endorsementComment, fromUser, toUser)
})

function validateForm(comment, from, to) {
    if(comment.length === 0 || from.length === 0 || to.length === 0) {
        statusMsg.textContent = "❌ Please fill in all the required fields"
    } else {
        addEndorsement(comment, from, to)
    }
}

function addEndorsement(comment, from, to) {
    let endorsement = {
        sender: from,
        recipient: to,
        endorsement: comment,
        likes: 0
    }
    push(endorsementsInDB, endorsement)
    statusMsg.textContent = "✅ Endorsement shared successfully"
    clearInputFields()
}

function clearInputFields() {
    endorsementInput.value = fromInput.value = toInput.value = ""
}

function copyLink() {
    navigator.clipboard.writeText(`https://aakashpereira.github.io/Endorsements-Pinboard#`);
}

onValue(endorsementsInDB, function(snapshot) {
    let endorsementsArray = Object.entries(snapshot.val())
    clearEndorsements()
    for(let i = 0; i < endorsementsArray.length; i++) {
        let endorsementID = endorsementsArray[i][0]
        let endorsementContent = endorsementsArray[i][1]
        
        let endorsementHTML = `<div class="endorsement">
                                    <p class="strong">To ${endorsementContent.recipient}</p>
                                    <p class="endorsement-comment">${endorsementContent.endorsement}</p>
                                    <div class="endorsement-footer">
                                        <p class="strong">From ${endorsementContent.sender}</p>
                                        <div id="${endorsementID}">
                                        </div>
                                    </div>
                                </div>`
        endorsementsContainer.insertAdjacentHTML("beforeend", endorsementHTML)
        let endorsementFooter = document.getElementById(endorsementID)
        let likeBtn = document.createElement("button")
        likeBtn.textContent = `❤️ ${endorsementContent.likes}`
        likeBtn.classList.add("like-btn")
        likeBtn.setAttribute("aria-label", "Like Endorsement")
        likeBtn.setAttribute("title", "Like Endorsement")
        if(localStorage.getItem(endorsementID)) {
            likeBtn.disabled = true
            likeBtn.classList.add("liked")
        } else {
            likeBtn.addEventListener("click", function() {
                endorsementsArray[i][1].likes++
                localStorage.setItem(endorsementID, "true") 
                update(ref(database, `endorsements/${endorsementID}`), endorsementContent)
            })
        }
        endorsementFooter.insertAdjacentElement("beforeend", likeBtn)
        let linkBtn = document.createElement("button")
        linkBtn.textContent = "🔗"
        linkBtn.setAttribute("aria-label", "Copy Link To Endorsement")
        linkBtn.setAttribute("title", "Copy Link")
        linkBtn.addEventListener("click", function() {
            navigator.clipboard.writeText(`https://aakashpereira.github.io/Endorsements-Pinboard#${endorsementID}`);
        })
        endorsementFooter.insertAdjacentElement("afterbegin", linkBtn)
    }
})

function clearEndorsements() {
    endorsementsContainer.innerHTML = ""
}