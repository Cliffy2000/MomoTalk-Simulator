// ==== data variables ====
var momotalkData;
var momotalkIngameData = {};
var momotalkEditorData = [];
var momotalkLoadBonus = false;

// ==== ui state variables ====
var momotalkPage = "home";
var momotalkCurrentStudent;

// ==== editor variables ====
var momotalkCurrentPerson;
var momotalkCurrentAffection; 
var momotalkEditorLineIndex = -1;
var momotalkStudentSelectorList = []; // this list will not contain the USER as it will be fixed at the front
var momotalkEditorCurrentChat = {};
var momotalkEditorTempChat = [];
var momotalkEditorMode;
var momotalkEditorPiece = -1;

// ==== viewer variables ====
var momotalkCurrentBlockIndex = 1;
var momotalkPreviewIndex;

// ==== icon resources ====
var momotalkIconHeader = "https://patchwiki.biligame.com/images/ba/b/bc/07q422a5ptvfj16ofv7lydx23cau6jv.svg";
var momotalkIconHome = "https://patchwiki.biligame.com/images/ba/9/95/qgkxufk29f99u84evef8l22mjzmfv9c.svg";
var momotalkIconEditorHome = "https://patchwiki.biligame.com/images/ba/b/b6/6fltk4dqf27r855q906emxmu6h8eqox.svg";
var momotalkIconChat = "https://patchwiki.biligame.com/images/ba/2/2e/mqqo4dtou5lugqgukf49wyplybtofrk.svg";
var momotalkPreviewEdit = "https://patchwiki.biligame.com/images/ba/a/a4/4bju5z07w3qkzb5o2enyo9i1e1ozgg9.svg";
var momotalkPreviewDelete = "https://patchwiki.biligame.com/images/ba/c/c6/9eg8t01h09evcwbvof0ssc20tz4rjzj.svg";



$(function() {
    // loads initial set of data
    $.ajax({
        url: "https://wiki.biligame.com/ba/index.php?title=MediaWiki:MomotalkMain.json&action=raw",
        dataType: "text",
        success: function(data) {
            momotalkData = JSON.parse(data);
            let chatPreview = generateChatPreviewList("main");

            $(".app").prepend(generateApp());
            $(".chatPreviewList").html(chatPreview);

            $(".appLoadingSvg img").delay(1750).animate({
                opacity: 0
            }, 500);
            $(".appLoading").animate({
                top: "-100%"
            }, 500, function() {
                $(".appLoading").remove();
                momotalkLoadFromCache();
                $(".mainWindow").append(generateEditorHomePage());
            });
        },
        error: function() {
            console.log("Failed to load initial student list");
        }
    });

    $(document).on('keypress', ".editorEntryInput", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            editorSave();
        }
    });
});


function generateApp() {
    let newPage = generateHomePage();
    return `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js"></script>

    <div class="appHeader">
        <div class="appHeaderImgWrapper">
            <img src="${momotalkIconHeader}">
        </div>
    </div>

    <div class="mainWindow">
        ${newPage}
    </div>

    <div class="appFooter">
        <div class="appFooterLeft" onclick="pressFooterLeft()">
            <img src="${momotalkIconHome}">
        </div>
        <div class="appFooterRight" onclick="pressFooterRight()">
            <img src="${momotalkIconEditorHome}">
        </div>
    </div>`;
}

function generateHomePage() {
    return `<div class="homePage">
        <div class="chatPreviewList"></div>
    </div>`;
}


function generateEditorHomePage() {
    let editorChatList = generateChatPreviewList("editor");
    let newPage = `<div class="editorHomePage" style="display:none">
        <div class="editorChatListWrapper">
            ${editorChatList}
        </div>
        <div class="editorButtonsPanel">
            <div class="editorDeleteButtonWrapper">
                <div class="editorDeleteButton editorButtonSmall" onclick="editorEditChats()">
                    <div class="editorButtonSmallText">
                        删除 
                    </div>
                </div>
            </div>
            <div class="editorCreateButtonWrapper">
                <div class="editorCreateButton editorButtonSmall" onclick="editorCreateNew()">
                    <div class="editorButtonSmallText">
                        新建
                    </div>
                </div>
            </div>
            <div class="editorImportButtonWrapper">
                <div class="editorImportButton editorButtonSmall" onclick="editorImport()" style="cursor:default">
                    <div class="editorButtonSmallText">
                        导入
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    return newPage;
}


// updates the visual effects of the left button on the footer bar
function setFooterLeftButton(mode, selected) {
    if (mode === "home") {
        $(".appFooterLeft").html(`<img src=${momotalkIconHome}>`);
    } else if (mode === "editorHome") {
        $(".appFooterLeft").html(`<img src=${momotalkIconEditorHome}>`);
    }

    if (selected) {
        $(".appFooterLeft").css({"background-color": "#68788F"});
        $(".appFooterLeft img").css({"opacity": "1"});
        $(".appFooterLeft").css({"cursor": "default"});
    } else {
        $(".appFooterLeft").css({"background-color": "#4c5b6f"});
        $(".appFooterLeft img").css({"opacity": "0.5"});
        $(".appFooterLeft").css({"cursor": "pointer"});
    }
}


// updates the visual effects of the right button on the footer bar
function setFooterRightButton(mode, selected) {
    if (mode === "ingameChat") {
        $(".appFooterRight").html(`<img src=${momotalkIconChat}>`);
    } else if (mode === "editorHome") {
        $(".appFooterRight").html(`<img src=${momotalkIconEditorHome}>`);
    } else if (mode === "editorSave") {
        $(".appFooterRight").html(`<div>保存</div>`);
    } else if (mode === "editorExport") {
        $(".appFooterRight").html(`<div>导出</div>`);
    } else if (mode === "editorView") {
        $(".appFooterRight").html(`<div>截图</div>`);
    }

    if (selected) {
        $(".appFooterRight").css({"background-color": "#68788F"});
        $(".appFooterRight img").css({"opacity": "1"});
        $(".appFooterRight").css({"cursor": "default"});
    } else {
        $(".appFooterRight").css({"background-color": "#4c5b6f"});
        $(".appFooterRight img").css({"opacity": "0.5"});
        $(".appFooterRight").css({"cursor": "pointer"});
    }
}


// onclick function for the left footer button
function pressFooterLeft() {
    $("*").stop(true, true);
    // return from ingame chat to main home page
    if (momotalkPage === "ingameChat") {
        momotalkPage = "home";
        $(".chatPreviewList").show();
        $(".ingameChatScreenWrapper").animate({
            left: "100%"
        }, 500, function() {
            $(".ingameChatScreenWrapper").remove();
        });
        setFooterLeftButton("home", true);
        setFooterRightButton("editorHome", false);
        momotalkCurrentBlockIndex = 1;
    } 

    // switch from editor home page to main home page
    else if (momotalkPage === "editorHome") {
        momotalkPage = "home";
        $(".homePage").show();
        $(".homePage").animate({"left": "0"}, 500);
        $(".editorHomepage").animate({"left": "100%"}, 500, function() {
            $(".editorHomePage").hide();
        });
        setFooterLeftButton("home", true);
        setFooterRightButton("editorHome", false);
    }

    else if ((momotalkPage === "editorSave") || (momotalkPage === "editorExport")) {
        momotalkPage = "editorHome";
        editorSaveDataToMain();
        $(".editorHomePage").show();
        $(".editorPage").animate({
            left: "100%"
        }, 500, function() {
            $(".editorPage").remove();
        });
        setFooterLeftButton("home", false);
        setFooterRightButton("editorHome", true);
    }

    else if (momotalkPage === "editorView") {
        momotalkPage = "editorHome";
        $(".editorHomePage").show();
        $(".editorChatScreen").animate({
            left: "100%"
        }, 500, function() {
            $(".editorChatScreen").remove();
        });
        setFooterLeftButton("home", false);
        setFooterRightButton("editorHome", true);
        momotalkCurrentBlockIndex = 1;
    }
}


// onclick function for the right footer button
function pressFooterRight() {
    $("*").stop(true, true);
    // switch from main home page to editor home page
    if (momotalkPage === "home") {
        momotalkPage = "editorHome";
        $(".editorHomepage").show();
        $(".homePage").animate({"left": "-100%"}, 500, function() {
            $(".homePage").hide();
        });
        $(".editorHomepage").animate({"left": "0"}, 500);

        setFooterLeftButton("home", false);
        setFooterRightButton("editorHome", true);
    }

    else if (momotalkPage === "editorSave") {
        momotalkPage = "editorExport";
        editorParse();
        editorRefresh();
        setFooterRightButton("editorExport", true);
    }

    else if (momotalkPage === "editorExport") {
        editorExport();
    }

    else if (momotalkPage === "editorView") {
        editorScreenshot();
    }
}


// generates a single chat preview line with name and status message
function generateChatPreview(select, mode) {
    // ingame chat preview, does not have editting
    if (mode === "main") {
        let student = select;
        let row = `<div class="chatPreview" onclick="openIngameChat('${student}')">
            <div class="previewImg">
                <img src="${momotalkData[student]["img"]}" >
            </div>
            <div class="previewText">
                <div class="previewName">${momotalkData[student]['cnName']}</div>
                <div class="previewMessage">${momotalkData[student]["statusLine"]}</div>
            </div>
        </div>`;
    
        return row;
    }

    else if (mode === "editor") {
        let chat = momotalkEditorData[select];
        let students = [];

        for (let block of Object.keys(chat)) {
            for (let line of chat[block]) {
                if (line[0] !== "USER") {
                    students.push(line[0]);
                }
            }
        }
        students = Array.from(new Set(students));

        let row;
        let lastLine = getLast(chat[getLast(Object.keys(chat))]);
        if (students.length === 1) {
            let message = lastLine[1];
            row = `<div class="chatPreview" style="cursor:default">
                <div class="editorPreviewImg">
                    <img src="${momotalkData[students[0]]["img"]}" >
                </div>
                <div class="editorPreviewText" onclick="openEditorChat(this)">
                    <div class="previewName">${momotalkData[students[0]]['cnName']}</div>
                    <div class="previewMessage">${message}</div>
                </div>
                <div class="editorEditIconWrapper" onclick="editorEditExisting(this)">
                    <img src="${momotalkPreviewEdit}">
                </div>
            </div>`;
        }

        else if (students.length > 1){
            let message = momotalkData[lastLine[0]]["cnName"] + ": " + lastLine[1];

            row = `<div class="chatPreview" style="cursor:default">
                <div class="editorPreviewImg">
                    <img src="${momotalkData["USER"]["img"]}">
                </div>
                <div class="editorPreviewText" onclick="openEditorChat(this)">
                    <div class="previewName">群聊</div>
                    <div class="previewMessage">${message}</div>
                </div>
                <div class="editorEditIconWrapper" onclick="editorEditExisting(this)">
                    <img src="${momotalkPreviewEdit}">
                </div>
            </div>`;
        }

        else {
            let message = lastLine[1];
            row = `<div class="chatPreview" style="cursor:default">
                <div class="editorPreviewImg">
                    <img src="${momotalkData["USER"]["img"]}" >
                </div>
                <div class="editorPreviewText" onclick="openEditorChat(this)">
                    <div class="previewName">自言自语</div>
                    <div class="previewMessage">${message}</div>
                </div>
                <div class="editorEditIconWrapper" onclick="editorEditExisting(this)">
                    <img src="${momotalkPreviewEdit}">
                </div>
            </div>`;
        }

        return row;
    }
}


function generateChatPreviewList(mode) {
    // creates the container for preview of ingame chat
    if (mode === "main") {
        let chatPreviews = ``;
        for (let student in momotalkData) {
            if (momotalkData[student]["publish"] === true) {
                chatPreviews += generateChatPreview(student, "main");
            }
        }

        let chatPreviewListContent = `
            <div class="chatPreviewListHeader">
                <div class="chatPreviewListHeaderText">
                    <p>学生列表</p>
                </div>
            </div>
            <div class="chatPreviewListContent">
                ${chatPreviews}
            </div>
        `;
        return chatPreviewListContent;
    }

    else if (mode === "editor") {
        let chatPreviews = ``;
        for (let i=0; i<momotalkEditorData.length; i++) {
            chatPreviews += generateChatPreview(i, "editor");
        }

        let chatPreviewListContent = `
            <div class="chatPreviewListHeader">
                <div class="chatPreviewListHeaderText">
                    <p>对话列表</p>
                </div>
            </div>
            <div class="chatPreviewListContent">
                ${chatPreviews}
            </div>
        `;
        return chatPreviewListContent;
    }
}


function openIngameChat(student) {
    if (momotalkPage === "home") {
        momotalkPage = "ingameChat";

        let currentUrl = "https://wiki.biligame.com/ba/index.php?title=MediaWiki:Momotalk" + student + ".min.jsn&action=raw";
        $.ajax({
            url: currentUrl,
            dataType: "text",
            success: function(data) {
                let currentJson = JSON.parse(data);
                momotalkIngameData[student] = {};
                for (let key in currentJson) {
                    momotalkIngameData[student][key] = currentJson[key];
                }
                let affectionSwapper = ``;
                for (let story in momotalkIngameData[student]) {
                    affectionSwapper += `<div class="ingameChatAffectionSwapper" onclick="ingameChatAffectionSwap(event)">${story.substring(9)}</div>`;
                }

                momotalkCurrentAffection = Object.keys(momotalkIngameData[student])[0];
                let newPage = `<div class="ingameChatScreenWrapper">
                    <div class="ingameChatScreen">
                    </div>
                    <div class="ingameChatAffectionBar">
                        ${affectionSwapper}
                    </div>
                </div>`;
                $(".mainWindow").append(newPage);
                $(".ingameChatAffectionSwapper:eq(0)").css("background-color", "#FA94A6");

                $(".ingameChatScreenWrapper").animate({
                    left: 0
                }, 500, function() {
                    $(".chatPreviewList").hide();
                    setFooterLeftButton("home", false);
                    setFooterRightButton("ingameChat", true);
                    momotalkCurrentStudent = student;
                    renderChatAnimationSequence("ingame", momotalkCurrentAffection, 0);
                });
            },
            error: function() {
                console.log("Failed to load specific data file for student");
            }
        });
    }
}


function ingameChatAffectionSwap(event) {
    let clickedElement = $(event.target);
    let story = "affection" + clickedElement.text();
    $(".ingameChatAffectionSwapper").css("background-color", "#90DBFA");
    clickedElement.css("background-color", "#FA94A6");
    $(".ingameChatScreen").html("");
    momotalkCurrentAffection = story;
    momotalkCurrentBlockIndex = 1;
    $(".ingameChatScreen").stop(true, false);
    renderChatAnimationSequence("ingame", momotalkCurrentAffection, 0);
}


function openEditorChat(element) {
    if (momotalkPage === "editorHome") {
        momotalkPage = "editorView";
        momotalkPreviewIndex = $(".editorPreviewText").index(element);
        let newPage = `<div class="editorChatScreen">
        </div>`;
        $(".mainWindow").append(newPage);
        $(".editorChatScreen").animate({
            left: 0
        }, 500, function() {
            $(".editorHomePage").hide();
            setFooterLeftButton("editorHome", false);
            setFooterRightButton("editorView", true);
            renderChatAnimationSequence("editor", momotalkPreviewIndex, 0);
        });
    }
}


function renderChatAnimationSequence(category, chatKey, recursiveIndex) {
    let currentChat;
    let chatWindow = $(".ingameChatScreen");
    if (category === "ingame") {
        currentChat = momotalkIngameData[momotalkCurrentStudent][chatKey];
    } else {
        currentChat = momotalkEditorData[chatKey];
        chatWindow = $(".editorChatScreen");
    }

    // reached end of chat sequence
    if (momotalkCurrentBlockIndex === -1) {
        return;
    }

    // preventing index out of range error
    if (momotalkCurrentBlockIndex >= currentChat.length) {
        return;
    }

    let currentBlock = currentChat[momotalkCurrentBlockIndex];

    // upcoming block is a user block, function should end after render
    if (currentBlock[0][0] === "USER") {
        renderUserOptions(currentBlock, category);
        momotalkCurrentBlockIndex = currentBlock[currentBlock.length - 1][3];
        return;
    }

    // end case for recursion
    // updates current block index to the next block
    if (recursiveIndex >= currentBlock.length) {
        momotalkCurrentBlockIndex = currentBlock[currentBlock.length - 1][3];
        renderChatAnimationSequence(category, chatKey, 0);
        return;
    }

    // recursive loop to go through a student message block
    $(chatWindow).queue(function (next) {
        let row = generateStudentMessageRow(currentBlock[recursiveIndex][0], currentBlock[recursiveIndex][1], currentBlock[recursiveIndex][2]);

        $(chatWindow).animate({ opacity: '1' }, 500, function () {
            $(chatWindow).append(row);
            $(chatWindow).scrollTop($(chatWindow)[0].scrollHeight);
            $(".messageRow:last").find(".chatTypingDots").delay(1000).fadeOut(1, function () {
                $(this).remove();
                $(".messageRow:last").find(".chatRowContent").show();
                $(chatWindow).scrollTop($(chatWindow)[0].scrollHeight);
                $(chatWindow).animate({ opacity: '1' }, 500, function () {
                    next();
                    renderChatAnimationSequence(category, chatKey, recursiveIndex + 1);
                });
            });
        });
    }).dequeue();
}


function generateStudentMessageRow(student, text, withIcon) {
    let msg = ``;
    if (text.indexOf(".png") === -1) {
        if (withIcon) {
            msg = `<div class="chatRowTextWithIcon chatRowContent" style="display: none" lang="en">
                ${text}
            </div>`;
        } else {
            msg = `<div class="chatRowText chatRowContent" style="display: none" lang="en">
                ${text}
            </div>`;
        }
        
    } else {
        msg = `<div class="chatRowImg chatRowContent" style="display: none">
                <div class="chatRowImgWrapper">
                    <img src="${text}">
                </div>
            </div>`
    }

    if (withIcon) {
        return `
            <div class="chatRowWithIcon messageRow">
                <div class="chatRowIcon">
                <img src="${momotalkData[student]["img"]}">
                </div>
                <div class="chatRowTextCol">
                    <div class="chatRowName">
                        ${momotalkData[student]['cnName']}
                    </div>
                    <div class="chatTypingDots">
                        <div class="typingDot1"></div>
                        <div class="typingDot2"></div>
                        <div class="typingDot3"></div>
                    </div>
                    ${msg}
                </div>
            </div>
        `;
    }

    else {
        return `
            <div class="chatRow messageRow">
                <div class="chatRowIcon"></div>
                <div class="chatRowTextCol">
                    <div class="chatTypingDots">
                        <div class="typingDot1"></div>
                        <div class="typingDot2"></div>
                        <div class="typingDot3"></div>
                    </div>
                    ${msg}
                </div>
            </div>
        `;
    }
}


function generateUserOptions(block, mode) {
    if (block.length === 1) {
        if ((block[0][1].slice(0,2) === "前往") && ((block[0][1].slice(-5) === "的羁绊剧情") || (block[0][1].slice(-5) === "的好感剧情"))) {
            let title = "好感事件";
            if (block[0][1].slice(-5) === "的羁绊剧情") {
                title = "羁绊事件";
            }
            return `<div class="affectionStory">
                <div class="affectionStoryContent">
                    <div class="affectionStoryHeader">
                        <div class="affectionStoryHeaderText">
                            <p>${title}</p>
                        </div>
                    </div>
                    <div class="affectionStorySelector">
                        <div class="affectionOption" onclick="updateBlockIndexAffection(${block[0][3]}, event, '${mode}')">${block[0][1]}</div>
                    </div>
                </div>
            <div>`;
        }
    }
    let options = ``;
    block.forEach(line => {
        options += `<div class="option" onclick="updateBlockIndex(this, ${line[3]}, '${mode}')">${line[1]}</div>`;
    });
    return `<div class="optionsRow">
        <div class="optionsRowContent">
            <div class="optionsHeader">
                <div class="optionsHeaderText">
                    <p>回复</p>
                </div>
            </div>
            <div class="optionSelector">
                ${options}
            </div>
        </div>
    <div>`;
}


function renderUserOptions(block, mode) {
    let chatWindow = $(".ingameChatScreen");
    if (mode === "editor") {
        chatWindow = $(".editorChatScreen");
    }

    $(chatWindow).queue(function (next) {
        let options = generateUserOptions(block, mode);
        $(chatWindow).animate({ opacity: '1' }, 200, function () {
            $(chatWindow).append(options);
            $(chatWindow).scrollTop($(chatWindow)[0].scrollHeight);
            next();
        });
    }).dequeue();
}


function updateBlockIndex(element, newBlockIndex, mode) {
    momotalkCurrentBlockIndex = newBlockIndex;
    let optionText = $(element).text();
    $(".optionsRow").remove();
    renderUserResponse(optionText, mode);
    if (mode === "ingame") {
        renderChatAnimationSequence(mode, momotalkCurrentAffection, 0);
    } else {
        renderChatAnimationSequence(mode, momotalkPreviewIndex, 0);
    }
}


function updateBlockIndexAffection(newBlockIndex, event, mode) {
    let currentElement = $(event.target);
    if ($(currentElement).attr("clickedOnAffection") === "true") {
        return;
    } else {
        $(currentElement).attr("clickedOnAffection", "true");
        momotalkCurrentBlockIndex = newBlockIndex;
        if (mode === "ingame") {
            renderChatAnimationSequence(mode, momotalkCurrentAffection, 0);
        } else {
            renderChatAnimationSequence(mode, momotalkPreviewIndex, 0);
        }
    }
}


function generateUserResponse(line) {
    return `<div class="responseRow">
        <div class="responseRowContent">
            <p>${line}</p>
        </div>
    </div>`;
}


function renderUserResponse(line, mode) {
    let chatWindow = $(".ingameChatScreen");
    if (mode === "editor") {
        chatWindow = $(".editorChatScreen");
    }

    $(chatWindow).queue(function (next) {
        let response = generateUserResponse(line);
        $(chatWindow).scrollTop($(chatWindow)[0].scrollHeight);
        $(chatWindow).animate({ opacity: '1' }, 200, function () {
            $(chatWindow).append(response);
            $(chatWindow).scrollTop($(chatWindow)[0].scrollHeight);
            next();
        });
    }).dequeue();
}


function generateEditorPage() {
    let newPage = `<div class="editorPage">
        <div class="editorData"></div>
        <div class="editorBarEntry">
            <div class="editorEntryIcon">
                <img src=${momotalkData["USER"]["img"]} onclick="renderStudentSelectPanel()">
            </div>
            <div class="editorEntryInputWrapper">
                <input class="editorEntryInput" type="text">
            </div>
            <div class="editorEntrySave" onclick="editorSave()">
                <div class="editorButtonSmall">
                    <div class="editorButtonSmallText">
                        发送
                    </div>
                </div>
            </div>
        </div>
        <div class="editorBarOptions" style="display:none">
            <div class="editorOptionInsert editorButtonLarge" onclick="editorInsert()">
                <div class="editorButtonLarge">
                    <div class="editorButtonLargeText">
                    在此行前插入
                    </div>
                </div>
            </div>
            <div class="editorOptionDelete editorButtonSmall" onclick="editorDelete()">
                <div class="editorButtonSmall">
                    <div class="editorButtonSmallText">
                        删除
                    </div>
                </div>
            </div>
            <div class="editorOptionEdit editorButtonSmall" onclick="editorEdit()">
                <div class="editorButtonSmall">
                    <div class="editorButtonSmallText">
                        编辑
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    return newPage;
}


function editorEditChats() {
    if (momotalkPage === "editorHome") {
        momotalkPage = "editorHomeEdit";
        $(".editorEditIconWrapper").replaceWith(`
            <div class="editorDeleteIconWrapper"     onclick="editorDeleteChat(this)">
                <img src="${momotalkPreviewDelete}">
            </div>
        `);
        $(".editorDeleteButton").html(`
            <div class="editorButtonSmallText">
                完成 
            </div>
        `);
    }

    else if (momotalkPage === "editorHomeEdit") {
        momotalkPage = "editorHome";
        $(".editorDeleteIconWrapper").replaceWith(`
            <div class="editorEditIconWrapper" onclick="editorEditExisting(this)">
                <img src="${momotalkPreviewEdit}">
            </div>
        `);
        $(".editorDeleteButton").html(`
            <div class="editorButtonSmallText">
                删除 
            </div>
        `);
    }
}


// onclick function that opens a new editor
function editorCreateNew() {
    if (momotalkPage === "editorHome") {
        momotalkPage = "editorExport";
        let newPage = generateEditorPage();
        $(".mainWindow").append(newPage);
        setFooterLeftButton("editorHome", false);
        setFooterRightButton("editorExport", true);
        $(".appFooterRight").css("cursor", "default");
    
        $(".editorPage").animate({
            left: "0"
        }, 500, function() {
            $(".editorHomePage").hide();
            momotalkEditorCurrentChat = {};
            momotalkEditorTempChat = [];
            momotalkEditorPiece = -1;
            momotalkEditorMode = "send";
            momotalkCurrentPerson = "USER";
        });
    }
}


function editorImport() {
    return;
}


function editorEditExisting(element) {
    if (momotalkPage === "editorHome") {
        momotalkPage = "editorExport";
        let newPage = generateEditorPage();
        $(".mainWindow").append(newPage);
        setFooterLeftButton("editorHome", false);
        setFooterRightButton("editorExport", true);
        $(".appFooterRight").css("cursor", "default");

        let previewIndex = $(".editorEditIconWrapper").index(element);
        momotalkEditorCurrentChat = momotalkEditorData[previewIndex];
        momotalkEditorPiece = previewIndex;
        editorRefresh();

        $(".editorPage").animate({
            left: "0"
        }, 500, function() {
            $(".editorHomePage").hide();
            momotalkEditorMode = "send";
            momotalkCurrentPerson = "USER";
        });
    }
}


function editorDeleteChat(element) {
    if (momotalkPage === "editorHomeEdit") {
        momotalkPage = "editorHome";
        let previewIndex = $(".editorDeleteIconWrapper").index(element);
        momotalkEditorData.splice(previewIndex, 1);
        let cacheData = JSON.stringify(momotalkEditorData);
        localStorage.setItem("MomotalkEditorData", cacheData);
        $(`.editorHomePage .chatPreview:eq(${previewIndex})`).remove();

        $(".editorDeleteIconWrapper").replaceWith(`
            <div class="editorEditIconWrapper" onclick="editorEditExisting(this)">
                <img src="${momotalkPreviewEdit}">
            </div>
        `);
        $(".editorDeleteButton").html(`
            <div class="editorButtonSmallText">
                删除 
            </div>
        `);
    }
}


// opens a popup window that allows character selection for editor
function renderStudentSelectPanel() {
    // intialize the selector list of there isn't one
    if (momotalkStudentSelectorList.length === 0) {
        for (let student in momotalkData) {
            if (student !== "USER") {
                momotalkStudentSelectorList.push(student);
            }
        }
    }

    let selectorContent = `<div class="editorStudentSelectIcon" onclick="updateStudentSelectList('USER')">
        <img src=${momotalkData["USER"]["img"]}>
    </div>`;
    momotalkStudentSelectorList.forEach(student => {
        selectorContent += `<div class="editorStudentSelectIcon" onclick="updateStudentSelectList('${student}')">
            <img src=${momotalkData[student]["img"]}>
        </div>`;
    })

    let selectPanel = `<div class="editorStudentSelectPanel">
        <div class="editorStudentSelectHeader">
            <p>选择一名角色</p>
        </div>
        <div class="editorStudentSelectGrid">
            ${selectorContent}
        </div>
    </div>`;

    $(".mainWindow").append(selectPanel);
    momotalkPage = "editorStudentSelect";
}


function updateStudentSelectList(person) {
    if (person !== "USER") {
        let index = momotalkStudentSelectorList.indexOf(person);
        momotalkStudentSelectorList.splice(index, 1);
        momotalkStudentSelectorList.unshift(person);
    }
    momotalkPage = "editorExport";
    momotalkCurrentPerson = person;
    $(".editorEntryIcon img").attr("src", momotalkData[person]["img"]);
    $(".editorStudentSelectPanel").remove();
}


function getLast(arr) {
    return arr[arr.length - 1];
}


function generateEditorRow(line, blockIndex) {
    let img = ``;
    let content = ``;
    let currentColor;
    let nextColor;

    let imgOpacity = 0.25;
    if (line[2]) {
        imgOpacity = 1;
    }

    img = `<img src="${momotalkData[line[0]]["img"]}" onclick="editorRowIconToggle(event);"> `;

    if (line[2]) {
        content = `
            <div class="editorRowPersonName">
                ${momotalkData[line[0]]["cnName"]}
            </div>
            <div class="editorRowTextContainer">
                <div class="editorRowText" lang="en">
                    ${line[1]}
                </div>
            </div>
        `;
    } else {
        content = `
            <div class="editorRowPersonName" style="display:none">
                ${momotalkData[line[0]]["cnName"]}
            </div>
            <div class="editorRowTextContainer">
                <div class="editorRowText" lang="en">
                    ${line[1]}
                </div>
            </div>
        `;
    }

    currentColor = editorIndexColor(blockIndex, "current");
    nextColor = editorIndexColor(line[3], "next");

    let nextIndex = line[3];
    if (nextIndex === null) {
        nextIndex = "";
    }


    let newLine = `<div class="editorDataRow" onclick="editorSelectRow(this)">
        <div class="editorBlockIndexWrapper">
            <div class="editorBlockIndex" style="background-color:${currentColor}">
                <input class="editorBlockIndexInput" type="text" value=${blockIndex} onclick="event.stopPropagation();" oninput="blockIndexChange(this)" readonly>
            </div>
        </div>
        <div class="editorRowIcon" style="opacity:${imgOpacity}">
            ${img}
        </div>
        <div class="editorRowTextWrapper">
            ${content}
        </div>
        <div class="editorNextBlockIndexWrapper">
            <div class="editorNextBlockIndex" style="background-color:${nextColor}">
            <input class="editorNextIndexInput" type="text" value="${nextIndex}" onclick="event.stopPropagation();" oninput="nextIndexChange(this)" readonly>
            </div>
        </div>
    </div>`;

    return newLine;
}


function editorRowIconToggle(event) {
    event.stopPropagation();
    if (momotalkEditorLineIndex !== -1) {
        let icon = momotalkEditorTempChat[momotalkEditorLineIndex]["line"][2];

        if (icon) {
            $(`.editorRowIcon:eq(${momotalkEditorLineIndex})`).css("opacity", "0.25");
            $(`.editorRowPersonName:eq(${momotalkEditorLineIndex})`).hide();
            momotalkEditorTempChat[momotalkEditorLineIndex]["line"][2] = false;
        } else {
            $(`.editorRowIcon:eq(${momotalkEditorLineIndex})`).css("opacity", "1");
            $(`.editorRowPersonName:eq(${momotalkEditorLineIndex})`).show();
            momotalkEditorTempChat[momotalkEditorLineIndex]["line"][2] = true;
        }
    }
    
    editorMadeChanges();
}


function editorIndexColor(text, type) {
    let num = Number(text);
    // dark red for error (unable to convert to number)
    if (isNaN(num)) {
        return "#CC2200";
    }

    if (text === "") {
        if (type === "current") {
            return "#CC2200"; // current cannot be empty
        } else if (type === "next") {
            return "#AAAAAA"; 
        }
    }

    if ((text === null) && (type === "next")) {
        return "#AAAAAA";
    }

    if (num === 0) {
        return "#CC2200";
    }

    if ((num < 0) && (type === "current")) {
        return "#CC2200";
    }
    if ((num < -1) && (type === "next")) {
        return "#CC2200";
    } else if ((num === -1) && (type === "next")) {
        return "#003153";
    }

    if (num % 2 === 0) {
        return "#90DBFA";
    } else if (num % 2 === 1) {
        return "#FA94A6";
    }
}


function blockIndexChange(element) {
    let text = $(element).val();
    let color = editorIndexColor(text, "current");
    $(element).parent().css("background-color", color);

    momotalkEditorTempChat[momotalkEditorLineIndex]["current"] = text;
    
    editorMadeChanges();
}


function nextIndexChange(element) {
    let text = $(element).val();
    let color = editorIndexColor(text, "next");
    $(element).parent().css("background-color", color);

    if (text === "") {
        momotalkEditorTempChat[momotalkEditorLineIndex]["line"][3] = null;
    } else {
        momotalkEditorTempChat[momotalkEditorLineIndex]["line"][3] = text;
    }
    
    editorMadeChanges();
}


function editorSelectRow(element) {
    if ($(element).attr("editorSelectedRow") === 'true') {
        $(".editorDataRow").removeAttr("editorSelectedRow");
        $(".editorDataRow").css('background-color', 'white');
        $(".editorBlockIndexInput").prop("readonly", true);
        $(".editorNextIndexInput").prop("readonly", true);
        $(".editorBarOptions").hide();
        $(".editorBarEntry").show();
        momotalkEditorMode = "send";
        momotalkEditorLineIndex = -1;
    }

    else {
        $(element).attr("editorSelectedRow", 'true');
        momotalkEditorLineIndex = $(".editorDataRow").index(element);
        $('.editorDataRow').css('background-color', 'white');
        $(element).css('background-color', '#d3d3d3');
        $(element).find(".editorBlockIndexInput").prop("readonly", false);
        $(element).find(".editorNextIndexInput").prop("readonly", false);

        $(".editorBarOptions").show();
        $(".editorBarEntry").hide();
        momotalkEditorMode = "options";
    }
}


function editorSave() {
    let text = $(".editorEntryInput").val();
    if (text === '') {
        return;
    }

    editorBonusCode(text);

    if (momotalkEditorMode === "send") {
        editorSend();
    }

    if (momotalkEditorMode === "edit") {
        editorSaveEdit();
    }

    if (momotalkEditorMode === "insert") {
        editorSaveInsert();
    }

    momotalkSaveToCache();
}


function editorSend() {
    let text = $(".editorEntryInput").val();

    let newLine = {
        "line": [momotalkCurrentPerson, text, true, -1],
        "current": 1
    };
    if (momotalkEditorTempChat.length > 0) {
        let prev = getLast(momotalkEditorTempChat);
        if ((prev["line"][0] !== "USER") && (momotalkCurrentPerson !== "USER")) {
            newLine["current"] = prev["current"];
            momotalkEditorTempChat[momotalkEditorTempChat.length-1]["line"][3] = null;
            $(".editorNextBlockIndex:last").css("background-color", "#AAAAAA");
            $(".editorNextIndexInput:last").val("");

            if (prev["line"][0] === momotalkCurrentPerson) {
                newLine["line"][2] = false;
            }
        } 
        
        else {{
            newLine["current"] = parseInt(prev["current"]) + 1;
            momotalkEditorTempChat[momotalkEditorTempChat.length-1]["line"][3] = newLine["current"];
            $(".editorNextIndexInput:last").val(newLine["current"]);
            $(".editorNextBlockIndex:last").css("background-color", editorIndexColor(newLine["current"]), "next");
        }}
    }

    momotalkEditorTempChat.push(newLine);
    let newRow = generateEditorRow(newLine["line"], newLine["current"]);
    $(".editorData").append(newRow);
    $(".editorData").scrollTop($(".editorData")[0].scrollHeight);
    $(".editorEntryInput").val("");
    
    editorMadeChanges();
}


function editorInsert() {
    $(".editorBarOptions").hide();
    $(".editorBarEntry").show();
    momotalkEditorMode = "insert"; 
}


function editorSaveInsert() {
    let text = $(".editorEntryInput").val();
    let selected = momotalkEditorTempChat[momotalkEditorLineIndex];
    let newLine = {
        "line": [momotalkCurrentPerson, text, true, null],
        "current": selected["current"]
    };

    if (selected["line"][0] === momotalkCurrentPerson) {
        momotalkEditorTempChat[momotalkEditorLineIndex]["line"][2] = false;
    }

    momotalkEditorTempChat.splice(momotalkEditorLineIndex, 0, newLine);
    let newRow = generateEditorRow(newLine["line"], newLine["current"]);
    $(`.editorDataRow:eq(${momotalkEditorLineIndex})`).before(newRow);
    $(".editorEntryInput").val("");
    
    editorMadeChanges();
}


function editorDelete() {
    $(`.editorDataRow:eq(${momotalkEditorLineIndex})`).remove();
    momotalkEditorTempChat.splice(momotalkEditorLineIndex, 1);
    $(".editorBarOptions").hide();
    $(".editorBarEntry").show();
    momotalkEditorMode = "send";
    
    editorMadeChanges();
}


function editorEdit() {
    $(".editorEntryInput").val(momotalkEditorTempChat[momotalkEditorLineIndex]["line"][1]);
    momotalkCurrentPerson = momotalkEditorTempChat[momotalkEditorLineIndex]["line"][0];
    $(".editorEntryIcon img").attr("src", momotalkData[momotalkCurrentPerson]["img"]);
    $(".editorBarOptions").hide();
    $(".editorBarEntry").show();
    momotalkEditorMode = "edit";
}


function editorSaveEdit() {
    momotalkEditorTempChat[momotalkEditorLineIndex]["line"][0] = momotalkCurrentPerson;
    momotalkEditorTempChat[momotalkEditorLineIndex]["line"][1] = $(".editorEntryInput").val();
    $(`.editorDataRow:eq(${momotalkEditorLineIndex})`).replaceWith(generateEditorRow(momotalkEditorTempChat[momotalkEditorLineIndex]["line"], momotalkEditorTempChat[momotalkEditorLineIndex]["current"]));
    
    $(".editorDataRow").removeAttr("editorSelectedRow");
    $(".editorDataRow").css('background-color', 'white');
    momotalkEditorMode = "send";
    $(".editorEntryInput").val("");

    editorMadeChanges();
}


function editorParse() {
    momotalkEditorCurrentChat = {};
    // change storage format
    momotalkEditorTempChat.forEach(line => {
        let updated = line["line"].slice(0).splice(0,4);
        updated.push(true);

        if (momotalkEditorCurrentChat.hasOwnProperty(line["current"])) {
            momotalkEditorCurrentChat[line["current"]].push(updated);
        }

        else {
            momotalkEditorCurrentChat[line["current"]] = [updated];
        }
    });

    let sortedBlockNums = Object.keys(momotalkEditorCurrentChat).sort();
    
    for (let num of sortedBlockNums) {
        if (momotalkEditorCurrentChat[num][0][0] === "USER") {
            for (let i=0; i<momotalkEditorCurrentChat[num].length; i++) {
                // user block has no jumpto
                if (momotalkEditorCurrentChat[num][i][3] === null) {
                    momotalkEditorCurrentChat[num][i][4] = false;
                }
            }
        }

        // this is a student block
        else {
            nextPointer = null;
            for (let i=0; i<momotalkEditorCurrentChat[num].length; i++) {
                // student block has jump before end of block
                if ((i !== momotalkEditorCurrentChat[num].length-1) && (momotalkEditorCurrentChat[num][i][3] !== null)) {
                    momotalkEditorCurrentChat[num][i][4] = false;
                }
            }
        }
    }
}


function editorRefresh() {
    let newPage = ``;
    momotalkEditorTempChat = [];
    for (let block of Object.keys(momotalkEditorCurrentChat)) {
        for (let line of momotalkEditorCurrentChat[block]) {
            newPage += generateEditorRow(line, block);
            momotalkEditorTempChat.push({
                "line": line,
                "current": block
            });
        }
    }

    $(".editorData").html(newPage);
}


function editorMadeChanges() {
    momotalkPage = "editorSave";
    setFooterRightButton("editorSave", true);
    $(".appFooterRight").css({"cursor": "pointer"});
}


function editorSaveDataToMain() {
    editorParse();
    if (Object.keys(momotalkEditorCurrentChat).length !== 0) {
        let copy = {...momotalkEditorCurrentChat};
        if (momotalkEditorPiece === -1) {
            momotalkEditorData.splice(0, 0, copy);
        } else {
            momotalkEditorData[momotalkEditorPiece] = copy;
        }

        let newPage = generateEditorHomePage();
        $(".editorHomePage").replaceWith(newPage);
        $(".editorHomePage").css("left", "0");
    }
    momotalkEditorTempChat = [];
    momotalkSaveToCache();
}


function editorExport() {
    if (momotalkEditorTempChat.length === 0) {
        return;
    }

    return;
}


function editorScreenshot() {
	return;
}


function editorBonusCode(text) {
    return;
}


function momotalkSaveToCache() {
    let cacheData = JSON.stringify(momotalkEditorData);
    localStorage.setItem("MomotalkEditorData", cacheData);
}


function momotalkLoadFromCache() {
    let cacheData = localStorage.getItem("MomotalkEditorData");
    if (cacheData) {
        momotalkEditorData = JSON.parse(cacheData);
    }
}