// Dados
import { CommAPI } from "./apiGithub.js"

class DataFavorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  // Aqui usamos o conceito de imutabilidade
  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    )
    this.entries = filteredEntries
    this.update()
    this.save()
  }

  async add(username) {
    try {
      const userExists = this.entries.find(
        (entry) => entry.login.toUpperCase() === username.toUpperCase()
      )
      if (userExists) {
        throw new Error("Usuário já cadastrado")
      }

      const user = await CommAPI.search(username)
      if (user.login === undefined) {
        throw new Error("Usuário não encontrado")
      }
      // Aqui usamos novamente o conceito de imutabilidade
      this.entries = [user, ...this.entries]
      this.update()
      this.save()
      // Limpar o campo input caso salvar
      this.search.value = ""
    } catch (error) {
      alert(error.message)
    }
  }

  save() {
    localStorage.setItem("@Github.Favorites", JSON.stringify(this.entries))
  }
}

// Construir a tabela
export class FavoritesView extends DataFavorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector("table tbody")
    this.search = this.root.querySelector("#username")
    this.update()
    this.onAdd()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@Github.Favorites")) || []
  }

  update() {
    this.removeAllTr()
    this.entries.forEach((user) => {
      const row = this.creatUser()

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`
      row.querySelector(".user img").alt = `Imagem de ${user.name}`
      row.querySelector(".user a").href = `https://github.com/${user.login}`
      row.querySelector(".name").textContent = user.name
      row.querySelector(".username").textContent = `/${user.login}`
      row.querySelector(".repositories").textContent = user.public_repos
      row.querySelector(".followers").textContent = user.followers

      const buttonRemove = row.querySelector(".remove")
      buttonRemove.addEventListener("click", () => {
        const isOk = confirm("Tem certeza que deseja deletar essa linha?")
        if (isOk) {
          this.delete(user)
        }
      })

      this.tbody.append(row)
    })

    this.verifyEmpty()
  }

  removeAllTr() {
    const tr = this.tbody.querySelectorAll("tr")
    tr.forEach((user) => {
      user.remove()
    })
  }

  creatUser() {
    const user = document.createElement("tr")
    user.innerHTML = `
    <td class="user">
      <img
        src="https://github.com/thiagoromulo.png"
        alt="Imagem de Thiago Romulo"
      />
      <a href="https://github.com/thiagoromulo" target="_blank">
        <p class="name">Thiago Romulo</p>
        <p class="username">/thiagoromulo</p>
      </a>
    </td>
    <td class="repositories">19</td>
    <td class="followers">1</td>
    <td><button class="remove">Remover</button></td>`
    console.log(user)
    return user
  }

  onAdd() {
    const addButton = this.root.querySelector(".buttonAdd")

    addButton.addEventListener("click", () => {
      const { value } = this.search
      this.add(value)
    })

    this.search.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        addButton.click()
      }
    })
  }

  verifyEmpty() {
    const empty = this.entries.length
    if (empty === 0) {
      this.root.querySelector(".empty").classList.remove("hide")
    } else {
      this.root.querySelector(".empty").classList.add("hide")
    }
  }
}
