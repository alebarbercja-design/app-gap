import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    reload,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* =====================================================
   CONFIGURACIÓN FIREBASE
   ===================================================== */

const firebaseConfig = {

    apiKey: "AIzaSyAooaNYIB4edEGENQAZqS6XXjiT4ByzB18",
  authDomain: "infinity-pox.firebaseapp.com",
  projectId: "infinity-pox",
  storageBucket: "infinity-pox.firebasestorage.app",
  messagingSenderId: "927039422504",
  appId: "1:927039422504:web:862ab60b036dab2fb6751d",
};


const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


/* =====================================================
   VARIABLES
   ===================================================== */

let currentUser = null;
let currentChatId = null;
let currentChatUser = null;

let unsubscribeMessages = null;
let unsubscribeChats = null;


/* =====================================================
   ELEMENTOS
   ===================================================== */

const authScreen =
    document.getElementById("authScreen");

const verificationScreen =
    document.getElementById("verificationScreen");

const mainScreen =
    document.getElementById("mainScreen");

const loginBox =
    document.getElementById("loginBox");

const registerBox =
    document.getElementById("registerBox");

const forgotBox =
    document.getElementById("forgotBox");

const authMessage =
    document.getElementById("authMessage");

const verificationMessage =
    document.getElementById("verificationMessage");


const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");


const registerName =
    document.getElementById("registerName");

const registerUsername =
    document.getElementById("registerUsername");

const registerEmail =
    document.getElementById("registerEmail");

const registerPassword =
    document.getElementById("registerPassword");

const registerPassword2 =
    document.getElementById("registerPassword2");

const registerBirth =
    document.getElementById("registerBirth");

const registerGender =
    document.getElementById("registerGender");


const forgotEmail =
    document.getElementById("forgotEmail");


const myName =
    document.getElementById("myName");

const myUsername =
    document.getElementById("myUsername");

const myAvatar =
    document.getElementById("myAvatar");


const chatList =
    document.getElementById("chatList");

const messagesBox =
    document.getElementById("messagesBox");


const chatUserName =
    document.getElementById("chatUserName");

const chatUserStatus =
    document.getElementById("chatUserStatus");

const chatUserAvatar =
    document.getElementById("chatUserAvatar");


const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");


const searchUser =
    document.getElementById("searchUser");

const searchResults =
    document.getElementById("searchResults");


/* =====================================================
   UTILIDADES
   ===================================================== */

function showMessage(
    element,
    text,
    error = false
) {

    element.textContent =
        text;

    element.style.color =
        error
            ? "#ef5350"
            : "#16a89f";
}


function hideAllAuthBoxes() {

    loginBox.classList.add("hidden");

    registerBox.classList.add("hidden");

    forgotBox.classList.add("hidden");
}


function showLogin() {

    hideAllAuthBoxes();

    loginBox.classList.remove("hidden");

    authMessage.textContent = "";
}


function showRegister() {

    hideAllAuthBoxes();

    registerBox.classList.remove("hidden");

    authMessage.textContent = "";
}


function showForgot() {

    hideAllAuthBoxes();

    forgotBox.classList.remove("hidden");

    authMessage.textContent = "";
}


function getInitial(name) {

    if (!name)
        return "U";

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;
}


/* =====================================================
   NAVEGACIÓN
   ===================================================== */

document
    .getElementById("showRegisterBtn")
    .addEventListener(
        "click",
        showRegister
    );


document
    .getElementById("backLoginBtn")
    .addEventListener(
        "click",
        showLogin
    );


document
    .getElementById("forgotBtn")
    .addEventListener(
        "click",
        showForgot
    );


document
    .getElementById("backForgotBtn")
    .addEventListener(
        "click",
        showLogin
    );


/* =====================================================
   REGISTRO
   ===================================================== */

document
    .getElementById("registerBtn")
    .addEventListener(
        "click",
        async () => {

            const name =
                registerName.value.trim();

            const username =
                registerUsername.value
                    .trim()
                    .toLowerCase();

            const email =
                registerEmail.value.trim();

            const password =
                registerPassword.value;

            const password2 =
                registerPassword2.value;

            const birth =
                registerBirth.value;

            const gender =
                registerGender.value;


            if (
                !name ||
                !username ||
                !email ||
                !password ||
                !password2 ||
                !birth ||
                !gender
            ) {

                showMessage(
                    authMessage,
                    "Completá todos los campos.",
                    true
                );

                return;
            }


            if (
                password !==
                password2
            ) {

                showMessage(
                    authMessage,
                    "Las contraseñas no coinciden.",
                    true
                );

                return;
            }


            if (
                password.length < 6
            ) {

                showMessage(
                    authMessage,
                    "La contraseña debe tener al menos 6 caracteres.",
                    true
                );

                return;
            }


            try {

                showMessage(
                    authMessage,
                    "Creando cuenta..."
                );


                const result =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    result.user;


                await setDoc(
                    doc(
                        db,
                        "usuarios",
                        user.uid
                    ),
                    {

                        uid:
                            user.uid,

                        nombre:
                            name,

                        username:
                            username,

                        email:
                            email,

                        fechaNacimiento:
                            birth,

                        genero:
                            gender,

                        creadoEn:
                            serverTimestamp()

                    }
                );


                await sendEmailVerification(
                    user
                );


                showMessage(
                    authMessage,
                    "Cuenta creada. Revisá tu correo electrónico."
                );


            } catch (error) {

                console.error(
                    "Error registrando usuario:",
                    error
                );


                let message =
                    "No se pudo crear la cuenta.";


                if (
                    error.code ===
                    "auth/email-already-in-use"
                ) {

                    message =
                        "Ese correo ya está registrado.";

                }


                if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    message =
                        "El correo electrónico no es válido.";

                }


                if (
                    error.code ===
                    "auth/weak-password"
                ) {

                    message =
                        "La contraseña es demasiado débil.";

                }


                showMessage(
                    authMessage,
                    message,
                    true
                );

            }

        }
    );


/* =====================================================
   LOGIN
   ===================================================== */

document
    .getElementById("loginBtn")
    .addEventListener(
        "click",
        async () => {

            const email =
                loginEmail.value.trim();

            const password =
                loginPassword.value;


            if (
                !email ||
                !password
            ) {

                showMessage(
                    authMessage,
                    "Ingresá tu correo y contraseña.",
                    true
                );

                return;
            }


            try {

                showMessage(
                    authMessage,
                    "Iniciando sesión..."
                );


                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            } catch (error) {

                console.error(error);


                showMessage(
                    authMessage,
                    "Correo o contraseña incorrectos.",
                    true
                );

            }

        }
    );


/* =====================================================
   RECUPERAR CONTRASEÑA
   ===================================================== */

document
    .getElementById("sendResetBtn")
    .addEventListener(
        "click",
        async () => {

            const email =
                forgotEmail.value.trim();


            if (!email) {

                showMessage(
                    authMessage,
                    "Ingresá tu correo.",
                    true
                );

                return;
            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                showMessage(
                    authMessage,
                    "Te enviamos el enlace para recuperar tu cuenta."
                );


            } catch (error) {

                console.error(error);


                showMessage(
                    authMessage,
                    "No se pudo enviar el correo.",
                    true
                );

            }

        }
    );


/* =====================================================
   VERIFICACIÓN
   ===================================================== */

document
    .getElementById("checkVerificationBtn")
    .addEventListener(
        "click",
        async () => {

            try {

                await reload(
                    auth.currentUser
                );


                if (
                    auth.currentUser
                    .emailVerified
                ) {

                    verificationScreen
                        .classList
                        .add("hidden");

                    mainScreen
                        .classList
                        .remove("hidden");


                    await cargarPerfil();

                    cargarChats();


                } else {

                    showMessage(
                        verificationMessage,
                        "Todavía falta verificar el correo.",
                        true
                    );

                }


            } catch (error) {

                console.error(error);


                showMessage(
                    verificationMessage,
                    "No se pudo comprobar la verificación.",
                    true
                );

            }

        }
    );


/* =====================================================
   REENVIAR CORREO
   ===================================================== */

document
    .getElementById("resendVerificationBtn")
    .addEventListener(
        "click",
        async () => {

            try {

                await sendEmailVerification(
                    auth.currentUser
                );


                showMessage(
                    verificationMessage,
                    "Correo de verificación enviado."
                );


            } catch (error) {

                console.error(error);


                showMessage(
                    verificationMessage,
                    "No se pudo enviar el correo. Esperá unos minutos antes de volver a intentarlo.",
                    true
                );

            }

        }
    );


/* =====================================================
   LOGOUT
   ===================================================== */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async () => {

            await signOut(auth);

        }
    );


document
    .getElementById("logoutVerificationBtn")
    .addEventListener(
        "click",
        async () => {

            await signOut(auth);

        }
    );


/* =====================================================
   ESTADO DE AUTENTICACIÓN
   ===================================================== */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            currentUser = null;

            authScreen
                .classList
                .remove("hidden");

            verificationScreen
                .classList
                .add("hidden");

            mainScreen
                .classList
                .add("hidden");

            return;
        }


        currentUser =
            user;


        await reload(user);


        if (
            !user.emailVerified
        ) {

            authScreen
                .classList
                .add("hidden");

            verificationScreen
                .classList
                .remove("hidden");

            mainScreen
                .classList
                .add("hidden");

            return;
        }


        authScreen
            .classList
            .add("hidden");

        verificationScreen
            .classList
            .add("hidden");

        mainScreen
            .classList
            .remove("hidden");


        await cargarPerfil();

        cargarChats();

    }
);


/* =====================================================
   PERFIL
   ===================================================== */

async function cargarPerfil() {

    if (!currentUser)
        return;


    const ref =
        doc(
            db,
            "usuarios",
            currentUser.uid
        );


    const snap =
        await getDoc(ref);


    if (!snap.exists())
        return;


    const data =
        snap.data();


    myName.textContent =
        data.nombre ||
        "Usuario";


    myUsername.textContent =
        "@" +
        (
            data.username ||
            "usuario"
        );


    myAvatar.textContent =
        getInitial(
            data.nombre
        );

}


/* =====================================================
   ID DEL CHAT
   ===================================================== */

function crearChatId(
    uid1,
    uid2
) {

    return [
        uid1,
        uid2
    ]
        .sort()
        .join("_");

}


/* =====================================================
   ABRIR CHAT
   ===================================================== */

async function abrirChat(user) {

    if (!currentUser || !user || !user.uid) {
    console.error("Usuario no válido:", user);
    return;
}

currentChatUser = user;

currentChatId = crearChatId(
    currentUser.uid,
    user.uid
);

document.getElementById("mainScreen")
    .classList.add("chat-open");


   

    chatUserName.textContent =
        user.nombre ||
        "Usuario";


    chatUserStatus.textContent =
        "@" +
        (
            user.username ||
            "usuario"
        );


    chatUserAvatar.textContent =
        getInitial(
            user.nombre
        );


    messagesBox.innerHTML = "";


    const chatRef =
        doc(
            db,
            "chats",
            currentChatId
        );


    const chatSnap =
        await getDoc(chatRef);


    if (!chatSnap.exists()) {

        await setDoc(
            chatRef,
            {

                participantes: [
                    currentUser.uid,
                    user.uid
                ],

                ultimoMensaje: "",

                actualizadoEn:
                    serverTimestamp()

            }
        );

    }


    escucharMensajes();

}


/* =====================================================
   MENSAJES EN TIEMPO REAL
   ===================================================== */

function escucharMensajes() {

    if (unsubscribeMessages) {

        unsubscribeMessages();

        unsubscribeMessages = null;
    }


    const messagesRef =
        collection(
            db,
            "chats",
            currentChatId,
            "mensajes"
        );


    const q =
        query(
            messagesRef,
            orderBy(
                "creadoEn",
                "asc"
            )
        );


    unsubscribeMessages =
        onSnapshot(
            q,
            snapshot => {

                messagesBox.innerHTML =
                    "";


                if (
                    snapshot.empty
                ) {

                    messagesBox.innerHTML =
                        `
                        <div class="empty-chat">
                            Todavía no hay mensajes.
                        </div>
                        `;

                    return;
                }


                snapshot.forEach(
                    messageSnap => {

                        const data =
                            messageSnap.data();


                        const isMine =
                            data.remitenteId ===
                            currentUser.uid;


                        const row =
                            document.createElement(
                                "div"
                            );


                        row.className =
                            "message-row " +
                            (
                                isMine
                                    ? "me"
                                    : "other"
                            );


                        const bubble =
                            document.createElement(
                                "div"
                            );


                        bubble.className =
                            "message-bubble";


                        const text =
                            document.createElement(
                                "div"
                            );


                        text.className =
                            "message-text";


                        text.textContent =
                            data.texto ||
                            "";


                        const meta =
                            document.createElement(
                                "div"
                            );


                        meta.className =
                            "message-meta";


                        let hora = "";


                        if (
                            data.creadoEn
                        ) {

                            const fecha =
                                data.creadoEn
                                    .toDate();


                            hora =
                                fecha
                                    .toLocaleTimeString(
                                        "es-AR",
                                        {
                                            hour:
                                                "2-digit",

                                            minute:
                                                "2-digit"
                                        }
                                    );

                        }


                        meta.textContent =
                            hora;


                        if (isMine) {

                            meta.textContent +=
                                " ✓✓";

                        }


                        bubble.appendChild(
                            text
                        );

                        bubble.appendChild(
                            meta
                        );

                        row.appendChild(
                            bubble
                        );

                        messagesBox.appendChild(
                            row
                        );

                    }
                );


                messagesBox.scrollTop =
                    messagesBox.scrollHeight;

            },

            error => {

                console.error(
                    "Error escuchando mensajes:",
                    error
                );


                messagesBox.innerHTML =
                    `
                    <div class="empty-chat">
                        No se pudieron cargar los mensajes.
                    </div>
                    `;

            }
        );

}


/* =====================================================
   ENVIAR MENSAJE
   ===================================================== */

async function enviarMensaje() {

    const texto =
        messageInput.value.trim();


    if (!texto)
        return;


    if (!currentUser)
        return;


    if (!currentChatUser) {

        alert(
            "Primero seleccioná una conversación."
        );

        return;
    }


    try {

        sendBtn.disabled =
            true;


        const messagesRef =
            collection(
                db,
                "chats",
                currentChatId,
                "mensajes"
            );


        await addDoc(
            messagesRef,
            {

                texto:
                    texto,

                remitenteId:
                    currentUser.uid,

                receptorId:
                    currentChatUser.uid,

                creadoEn:
                    serverTimestamp(),

                estado:
                    "enviado"

            }
        );


        await updateDoc(
            doc(
                db,
                "chats",
                currentChatId
            ),
            {

                ultimoMensaje:
                    texto,

                ultimoRemitente:
                    currentUser.uid,

                actualizadoEn:
                    serverTimestamp()

            }
        );


        messageInput.value =
            "";


    } catch (error) {

        console.error(
            "Error enviando mensaje:",
            error
        );


        alert(
            "No se pudo enviar el mensaje."
        );


    } finally {

        sendBtn.disabled =
            false;

    }

}


sendBtn.addEventListener(
    "click",
    enviarMensaje
);


messageInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            enviarMensaje();

        }

    }
);


/* =====================================================
   BUSCAR USUARIOS
   ===================================================== */

let searchTimeout;


searchUser.addEventListener(
    "input",
    () => {

        clearTimeout(
            searchTimeout
        );


        searchTimeout =
            setTimeout(
                buscarUsuarios,
                400
            );

    }
);


async function buscarUsuarios() {

    const text =
        searchUser.value
            .trim()
            .toLowerCase();


    searchResults.innerHTML =
        "";


    if (!text)
        return;


    try {

        const usersRef =
            collection(
                db,
                "usuarios"
            );


        const snapshot =
            await getDocs(
                usersRef
            );


        snapshot.forEach(
            userSnap => {

                const user =
                    userSnap.data();


                if (
                    user.uid ===
                    currentUser.uid
                )
                    return;


                const name =
                    (
                        user.nombre ||
                        ""
                    )
                        .toLowerCase();


                const username =
                    (
                        user.username ||
                        ""
                    )
                        .toLowerCase();


                if (
                    name.includes(text) ||
                    username.includes(text)
                ) {

                    const element =
                        document.createElement(
                            "div"
                        );


                    element.className =
                        "search-user";


                    element.innerHTML =
                        `
                        <div class="avatar">
                            ${getInitial(user.nombre)}
                        </div>

                        <div>
                            <strong>
                                ${escapeHTML(
                                    user.nombre ||
                                    "Usuario"
                                )}
                            </strong>

                            <small>
                                @${escapeHTML(
                                    user.username ||
                                    "usuario"
                                )}
                            </small>
                        </div>
                        `;


                    element.addEventListener(
                        "click",
                        () => {

                            abrirChat(
                                user
                            );

                            searchResults.innerHTML =
                                "";

                            searchUser.value =
                                "";

                        }
                    );


                    searchResults.appendChild(
                        element
                    );

                }

            }
        );


    } catch (error) {

        console.error(
            "Error buscando usuarios:",
            error
        );

    }

}


/* =====================================================
   CARGAR CHATS
   ===================================================== */

function cargarChats() {

    if (!currentUser)
        return;


    if (unsubscribeChats) {

        unsubscribeChats();

    }


    const chatsRef =
        collection(
            db,
            "chats"
        );


    const q =
        query(
            chatsRef,
            where(
                "participantes",
                "array-contains",
                currentUser.uid
            )
        );


    unsubscribeChats =
        onSnapshot(
            q,
            async snapshot => {

                chatList.innerHTML =
                    "";


                if (
                    snapshot.empty
                ) {

                    chatList.innerHTML =
                        `
                        <div class="empty-chat">
                            No tenés conversaciones todavía.
                        </div>
                        `;

                    return;
                }


                for (
                    const chatSnap
                    of snapshot.docs
                ) {

                    const chat =
                        chatSnap.data();


                    const otherUid =
                        chat.participantes.find(
                            uid =>
                                uid !==
                                currentUser.uid
                        );


                    if (!otherUid)
                        continue;


                    const userSnap =
                        await getDoc(
                            doc(
                                db,
                                "usuarios",
                                otherUid
                            )
                        );


                    if (
                        !userSnap.exists()
                    )
                        continue;


                    const user =
                        userSnap.data();


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "chat-item";


                    if (
                        currentChatId ===
                        chatSnap.id
                    ) {

                        item.classList.add(
                            "active"
                        );

                    }


                    item.innerHTML =
                        `
                        <div class="avatar">
                            ${getInitial(user.nombre)}
                        </div>

                        <div class="chat-info">

                            <strong>
                                ${escapeHTML(
                                    user.nombre ||
                                    "Usuario"
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    chat.ultimoMensaje ||
                                    "Nueva conversación"
                                )}
                            </small>

                        </div>
                        `;


                    item.addEventListener(
                        "click",
                        () => {

                            abrirChat(
                                user
                            );

                        }
                    );


                    chatList.appendChild(
                        item
                    );

                }

            },

            error => {

                console.error(
                    "Error cargando chats:",
                    error
                );

            }
        );

}


/* =====================================================
   ELIMINAR CHAT
   ===================================================== */

document
    .getElementById("deleteChatBtn")
    .addEventListener(
        "click",
        async () => {

            if (!currentChatId) {

                alert(
                    "Primero seleccioná un chat."
                );

                return;
            }


            if (
                !confirm(
                    "¿Querés eliminar la conversación?"
                )
            )
                return;


            try {

                const messagesRef =
                    collection(
                        db,
                        "chats",
                        currentChatId,
                        "mensajes"
                    );


                const snapshot =
                    await getDocs(
                        messagesRef
                    );


                for (
                    const item
                    of snapshot.docs
                ) {

                    await deleteDoc(
                        item.ref
                    );

                }


                await deleteDoc(
                    doc(
                        db,
                        "chats",
                        currentChatId
                    )
                );


                currentChatId =
                    null;

                currentChatUser =
                    null;


                chatUserName.textContent =
                    "Seleccioná un chat";


                chatUserStatus.textContent =
                    "IPX Messenger";


                messagesBox.innerHTML =
                    `
                    <div class="welcome-chat">

                        <div class="welcome-logo">
                            IPX
                        </div>

                        <h2>
                            Bienvenido a IPX
                        </h2>

                        <p>
                            Seleccioná una conversación para comenzar.
                        </p>

                    </div>
                    `;


            } catch (error) {

                console.error(
                    "Error eliminando conversación:",
                    error
                );

            }

        }
    );


/* =====================================================
   BLOQUEAR USUARIO
   ===================================================== */

document
    .getElementById("blockUserBtn")
    .addEventListener(
        "click",
        async () => {

            if (
                !currentChatUser
            ) {

                alert(
                    "Primero seleccioná un usuario."
                );

                return;
            }


            if (
                !confirm(
                    `¿Querés bloquear a ${currentChatUser.nombre}?`
                )
            )
                return;


            try {

                await setDoc(
                    doc(
                        db,
                        "bloqueados",
                        currentUser.uid,
                        "usuarios",
                        currentChatUser.uid
                    ),
                    {

                        usuarioId:
                            currentChatUser.uid,

                        fecha:
                            serverTimestamp()

                    }
                );


                alert(
                    "Usuario bloqueado."
                );


            } catch (error) {

                console.error(
                    "Error bloqueando usuario:",
                    error
                );

            }

        }
    );


/* =====================================================
   SELECTOR DE EMOJIS IPX MESSENGER
   ===================================================== */

const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");
const emojiContainer = document.querySelector(".emoji-picker-container");

// Abrir y cerrar el menú
emojiBtn.addEventListener("click", (event) => {
    event.stopPropagation();

    emojiPicker.classList.toggle("hidden");
});

// Insertar el emoji seleccionado en el mensaje
emojiPicker.querySelectorAll("span").forEach((emoji) => {
    emoji.addEventListener("click", () => {
        const emojiText = emoji.textContent;
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        const text = messageInput.value;

        messageInput.value =
            text.slice(0, start) +
            emojiText +
            text.slice(end);

        // Colocar el cursor después del emoji
        const newPosition = start + emojiText.length;

        messageInput.focus();
        messageInput.setSelectionRange(
            newPosition,
            newPosition
        );

        // Mantener abierto el menú para elegir más emojis
        emojiPicker.classList.remove("hidden");
    });
});

// Cerrar el menú al tocar fuera de él
document.addEventListener("click", (event) => {
    if (!emojiContainer.contains(event.target)) {
        emojiPicker.classList.add("hidden");
    }
});

// Cerrar con la tecla Escape
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        emojiPicker.classList.add("hidden");
    }
});

console.log("Selector de emojis IPX activado.");


/* ================= VOLVER A LOS CHATS ================= */

const backToChatsBtn =
    document.getElementById("backToChatsBtn");

backToChatsBtn.addEventListener("click", () => {
    document.getElementById("mainScreen")
        .classList.remove("chat-open");
});