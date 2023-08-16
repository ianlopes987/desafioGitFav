export class GithubUser{
    static search(username){
        const endpoint = `https://api.github.com/users/${username}`

        return fetch(endpoint)
        .then(data => data.json())
        .then(({login,name,public_repos,followers}) => ({
            login,
            name,
            public_repos,
            followers
        }))
    }

    // essa classe captura os dados da api do github atraves do fetch
}


export class Favorites {
    constructor(root){
        this.root = document.querySelector(root);
        this.load();

        /* construtor carregando os dados na chamada do objeto */
    }

    load(){
        
        this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []

        /* carrega os dados que estao gravados no localStorage do navegador e transforma e JSON
        no localStorage é um lugar onde podemos guardar dados no formato chave valor, entao podemos colocar
        ali um array de dados por exemplo como é o nosso caso, mas ele guarda string, por esse motivo 
        estamos fazendo a conversao do dados para JSON*/
    }

    save(){
        localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))

        /* setando o dado dentro do local storage. ou seja, inserindo um aarray dentro
        do local storage */
    }

    delete(user){
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login) // esse metodo filter retorna um array, pela logica ele retorna um array excluindo o login que for igual ao login pesquisado

        this.entries = filteredEntries; // com o array que retorna do filter, definimos dentro de um array com nome entries
        this.update(); //chamando a funcao update que cria uma estrutura em formato de tabela no HTML
        this.save(); //salva o novo array dentro do localStorage
    }

    async add(username) {

        try{

            const userExists = this.entries.find(entry => entry.login === username)

            if(userExists){
                throw new Error("Usuario ja cadastrado");
            }

            const user = await GithubUser.search(username);

            // conseideramos essa funcao como assincrona, pois dentro da const user, nos chamamos o metodo search que retorna uma promessa, entao temos que usar o AWAIT em vez de usar o THEN, que é mais simples, então criamos uma funcao ASYNC e colocamos o AWAIT

            if(user.login === undefined){
                throw new Error("Usuário não encontrado!");
            } /* caso o login nao exista na api, apresentamos esse erro  */

            this.entries = [user, ...this.entries] /* aqui estamos dizendo que iremos inserir um novo usuario de retorno do search e inserindo no array entries, e tambem criando um novo array entries para respeitar a lei da imutabilidade */
            this.update(); // atualizando a tabela em HTML
            this.save(); // salvando os novos dados no local storage
        } catch(error){
            alert(error.message) //caso der erro executamos a messagem no catch
        }
    }
}


export class FavoritesView extends Favorites{
    constructor(root){
        super(root);

        this.tbody = this.root.querySelector("table tbody") //seleciona o tbody que é o corpo da tabela

        this.zero = this.root.querySelector(".zero")

        this.update(); //chamando o metodo update para carregar o elemento gtml e a tabela

        this.onadd(); // o metodo onadd adiciona um novo usuario ao clicar no botao adicionar

    }

    onadd(){
        const addButton = this.root.querySelector(".search button");
        addButton.onclick = () => {
            const {value} = this.root.querySelector(".search input");
            this.add(value);
        }

        //adiciona um novo usuario 
    }

    update(){

        if(this.entries.length == 0){
            this.zero.classList.remove('hide');
        } else{
            this.zero.classList.add('hide');
        }
        this.removeAllTr(); //zera a tabela



        this.entries.forEach(user => {
            const row = this.createRow();

            row.querySelector(".user img").src = `https://github.com/${user.login}.png`
            row.querySelector(".user img").alt = `Imagem de ${user.name}`
            row.querySelector(".user a").href = `https://github.com/${user.login}`
            row.querySelector(".user span").textContent = user.name
            row.querySelector(".user p").textContent = user.login
            row.querySelector(".repositories").textContent = user.public_repos
            row.querySelector(".followers").textContent = user.followers

            row.querySelector(".remove").onclick = () => {
                const isOk = confirm("Tem certeza que deseja cancelar essa linha?");
                if(isOk){
                    this.delete(user)
                }
            }

            this.tbody.append(row);



        }) /*é um laco de repeticao que entra em cada objeto entries que esta na primeira classe
        e define alguns dados dentro de uma linha que é cirada atraves do createRow, essas linhas é que vao
        aparecer na tabela preenchidas com os dados do objeto que ja esta definido na primeira classe.*/

    }

    createRow(){

        const tr = document.createElement("tr");

        tr.innerHTML =         
        `
        <td class="user">
            <img src="https://github.com/maykbrito.png" alt="">
            <a href="https://github.com/maykbrito">
                <p>Mayk Brito</p>
                <span>maykbrito</span>
            </a>
        </td>
        <td class="repositories">
            76
        </td>
        <td class="followers">
            9589
        </td>
        <td>
            <button class="remove">Remover</button>
        </td>
    `;

    return tr

    }

    removeAllTr(){
        

        this.tbody.querySelectorAll("tr").forEach((tr) => {
            tr.remove();
        })
    }

    /* esse metodo creat row cria uma tag tr dentro e insere dentro dela a estrutura de uma tabela
    atraves do inner html.*/
}