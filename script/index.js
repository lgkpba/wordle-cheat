const quantidade = document.getElementById("quantidade");

const corretasDiv = document.getElementById("corretas");
const existentesDiv = document.getElementById("existentes");
const excluidasDiv = document.getElementById("excluidas");

let palavras = {};

async function carregarJSON() {
    const resposta = await fetch("./data/novo_dicionario.json");

    if (!resposta.ok) {
        throw new Error("Erro ao carregar JSON.");
    }

    palavras = await resposta.json();
}

function criarCaixas(container, quantidadeCaixas) {
    container.innerHTML = "";

    for (let i = 0; i < quantidadeCaixas; i++) {
        const input = document.createElement("input");

        input.type = "text";
        input.maxLength = 1;
        input.autocomplete = "off";
        input.autocorrect = "off";
        input.autocapitalize = "characters";
        input.spellcheck = false;

        // Sempre maiúsculo
        input.addEventListener("input", () => {
            input.value = input.value
                .toUpperCase()
                .replace(/[^A-ZÀ-ÚÇ]/g, "")
                .slice(0, 1);
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
    const larguraDisponivel = document.getElementById("form").clientWidth - 40;
    const gap = 8;

    const tamanhoCelula = Math.min(
        60,
        Math.floor((larguraDisponivel - gap * (tamanho - 1)) / tamanho)
    );

    document.documentElement.style.setProperty(
        "--cell-size",
        `${tamanhoCelula}px`
    );

    criarCaixas(corretasDiv, tamanho);
    criarCaixas(existentesDiv, tamanho);

    // Número de colunas igual ao tamanho da palavra
    corretasDiv.style.gridTemplateColumns = `repeat(${tamanho}, var(--cell-size))`;
    existentesDiv.style.gridTemplateColumns = `repeat(${tamanho}, var(--cell-size))`;
    excluidasDiv.style.gridTemplateColumns = `repeat(${tamanho}, var(--cell-size))`;

    excluidasDiv.innerHTML = "";
    criarCampoExcluidas();
}

function criarCampoExcluidas() {
    const input = document.createElement("input");

    input.type = "text";
    input.maxLength = 1;
    input.autocomplete = "off";
    input.autocorrect = "off";
    input.autocapitalize = "characters";
    input.spellcheck = false;

    input.addEventListener("input", () => {
        input.value = input.value
            .toUpperCase()
            .replace(/[^A-ZÀ-ÚÇ]/g, "")
            .slice(0, 1);
            
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

    excluidasDiv.appendChild(input);
}

function atualizarExcluidas() {
    const inputs = [...excluidasDiv.querySelectorAll("input")];

    // Se a última caixa foi preenchida, cria outra
    const ultimo = inputs[inputs.length - 1];

    if (ultimo && ultimo.value !== "") {
        criarCampoExcluidas();
    }

    // Remove caixas vazias extras, mantendo apenas uma no final
    const todos = [...excluidasDiv.querySelectorAll("input")];

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

function buscar() {
    tamanho = quantidade.value
    
    const corretas = [];
    const existentes = [];
    const excluidas = [];

    // Letras corretas
    corretas.push(
        ...Array.from(corretasDiv.querySelectorAll("input"))
            .map((input, indice) => ({
                letra: input.value.toUpperCase(),
                posicao: indice
            }))
            .filter(item => item.letra !== "")
    );

    // Letras existentes
    existentes.push(
        ...Array.from(existentesDiv.querySelectorAll("input"))
            .map((input, indice) => ({
                letra: input.value.toUpperCase(),
                posicao: indice
            }))
            .filter(item => item.letra !== "")
    );

    // Letras excluídas
    excluidas.push(
        ...Array.from(excluidasDiv.querySelectorAll("input"))
            .map(input => input.value.toUpperCase())
            .filter(letra => letra !== "")
    );

    const resultado = buscarPalavras(
        tamanho,
        corretas,
        existentes,
        excluidas
    );
    console.log(resultado)
}

function buscarPalavras(tamanho, corretas, existentes, excluidas) {
    const lista = palavras[tamanho];
    if (!lista) return [];

    const resultado = [];

    for (const palavra in lista) {
        let valida = true;
        const letras = palavra.split("");

        // Verifica letras corretas
        for (const item of corretas) {
            if (palavra[item.posicao] !== item.letra) {
                valida = false;
                break;
            }

            letras[item.posicao] = null;
        }

        if (!valida) continue;

        // Verifica letras existentes
        for (const item of existentes) {

            // Não pode estar na posição informada
            if (palavra[item.posicao] === item.letra) {
                valida = false;
                break;
            }

            const indice = letras.indexOf(item.letra);

            if (indice === -1) {
                valida = false;
                break;
            }

            letras[indice] = null;
        }

        if (!valida) continue;

        // Verifica letras excluídas
        for (const letra of excluidas) {
            if (letras.includes(letra)) {
                valida = false;
                break;
            }
        }

        if (valida) {
            resultado.push(palavra);
        }
    }

    return resultado;
}

async function iniciar() {
    await carregarJSON();
    atualizarCampos();
}

quantidade.addEventListener("change", atualizarCampos);

// Inicializa a página
iniciar();