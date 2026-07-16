const quantidade = document.getElementById("quantidade");

const corretas = document.getElementById("corretas");
const existentes = document.getElementById("existentes");
const excluidas = document.getElementById("excluidas");

function criarCaixas(container, quantidadeCaixas) {
    container.innerHTML = "";

    for (let i = 0; i < quantidadeCaixas; i++) {
        const input = document.createElement("input");

        input.type = "text";
        input.maxLength = 1;

        // Sempre maiúsculo
        input.addEventListener("input", () => {
            input.value = input.value
                .toUpperCase()
                .replace(/[^A-ZÀ-ÚÇ]/g, "");
        });

        // Vai para a próxima caixa automaticamente
        input.addEventListener("input", () => {
            if (input.value && input.nextElementSibling) {
                input.nextElementSibling.focus();
            }
        });

        // Backspace volta para a anterior
        input.addEventListener("keydown", (e) => {
            if (
                e.key === "Backspace" &&
                input.value === "" &&
                input.previousElementSibling
            ) {
                input.previousElementSibling.focus();
            }
        });

        container.appendChild(input);
    }
}

function atualizarCampos() {
    const tamanho = Number(quantidade.value);

    criarCaixas(corretas, tamanho);
    criarCaixas(existentes, tamanho);

    // Número de colunas igual ao tamanho da palavra
    corretas.style.gridTemplateColumns = `repeat(${tamanho}, 60px)`;
    existentes.style.gridTemplateColumns = `repeat(${tamanho}, 60px)`;
    excluidas.style.gridTemplateColumns = `repeat(${tamanho}, 60px)`;

    excluidas.innerHTML = "";
    criarCampoExcluidas();
}

function criarCampoExcluidas() {
    const input = document.createElement("input");

    input.type = "text";
    input.maxLength = 1;

    input.addEventListener("input", () => {
        input.value = input.value
            .toUpperCase()
            .replace(/[^A-ZÀ-ÚÇ]/g, "");

        atualizarExcluidas();
    });

    input.addEventListener("input", () => {
        if (input.value && input.nextElementSibling) {
            input.nextElementSibling.focus();
        }
    });

    input.addEventListener("keydown", (e) => {
        if (
            e.key === "Backspace" &&
            input.value === "" &&
            input.previousElementSibling
        ) {
            input.previousElementSibling.focus();
        }
    });

    excluidas.appendChild(input);
}

function atualizarExcluidas() {
    const inputs = [...excluidas.querySelectorAll("input")];

    // Se a última caixa foi preenchida, cria outra
    const ultimo = inputs[inputs.length - 1];

    if (ultimo && ultimo.value !== "") {
        criarCampoExcluidas();
    }

    // Remove caixas vazias extras, mantendo apenas uma no final
    const todos = [...excluidas.querySelectorAll("input")];

    for (let i = todos.length - 2; i >= 0; i--) {
        if (
            todos[i].value === "" &&
            todos[i + 1].value === ""
        ) {
            todos[i + 1].remove();
        } else {
            break;
        }
    }
}

quantidade.addEventListener("change", atualizarCampos);

// Inicializa a página
atualizarCampos();