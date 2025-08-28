
function Pessoa(altura, peso) {
    if (!altura || !peso) {
        throw new Error("Altura e peso são obrigatórios");
    }

    this.altura = altura;
    this.peso = peso;
}

function Nutricionista(altura, peso) {
    Pessoa.call(this, altura, peso);

    this.imc = function () {
        var xhr = new XMLHttpRequest();
        // false = requisição síncrona
        xhr.open("POST", "http://localhost:3000/imc/calculate", false);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ height: this.altura, weight: this.peso }));

        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            return response.imc;
        } else {
            throw new Error("Erro na requisição IMC: " + xhr.status);
        }
    };

    this.classificaIMC = function () {
        var imc = this.imc();
        if (imc < 18.5) return "Abaixo do peso";
        if (imc >= 18.5 && imc < 24.9) return "Peso normal";
        if (imc >= 25 && imc < 29.9) return "Sobrepeso";
        return "Obesidade";
    };
}
Nutricionista.prototype = Object.create(Pessoa.prototype);
Nutricionista.prototype.constructor = Nutricionista;

function renderizaResultadoIMC(nutricionista) {
    document.getElementById("imc").innerText =
        nutricionista.imc() + " - " + nutricionista.classificaIMC();

    var linhas = document.querySelectorAll("#tabelaIMC tr");
    for (var i = 0; i < linhas.length; i++) {
        linhas[i].classList.remove("destacado");
    }

    var mapClassToId = {
        "Abaixo do peso": "magreza",
        "Peso normal": "normal",
        "Sobrepeso": "sobrepeso",
        "Obesidade": "obesidade"
    };
    var idLinha = mapClassToId[nutricionista.classificaIMC()];
    if (idLinha) {
        var linha = document.getElementById(idLinha);
        if (linha) linha.classList.add("destacado");
    }
}

function actionCalcularIMCBuilder() {
    var alturaEl = document.getElementById("altura");
    var pesoEl = document.getElementById("peso");

    return function actionCalcularIMC(evt) {
        evt.preventDefault();

        var altura = parseFloat(alturaEl.value.replace(',', '.'));
        var peso = parseFloat(pesoEl.value.replace(',', '.'));

        if (isNaN(altura) || isNaN(peso) || altura <= 0 || peso <= 0) {
            document.getElementById("imc").innerText = "Por favor, preencha altura e peso corretamente.";
            return;
        }

        var nutricionista = new Nutricionista(altura, peso);
        renderizaResultadoIMC(nutricionista);
    }
}

window.onload = function () {
    document.getElementById("formIMC").addEventListener("submit", actionCalcularIMCBuilder());
};