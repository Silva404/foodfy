const db = require("../../config/db")
const { hash } = require('bcryptjs')

module.exports = {
  async findOne(filters){
    let query = `SELECT * FROM users`

    Object.keys(filters).map(key => {
      query = `${query} ${key}`

      Object.keys(filters[key]).map(field => {
        query = `${query} ${field} = ${filters[key][field]}`
      })
    })

    const results = await db.query(query)

    return results.rows[0]
  },
  async create(data){
    const query = `
    INSERT INTO users(
      name,
      email,
      address,
      password
    )
    `
    const passwordHash = await hash(data.password, 8)

    const values = [
      data.name,
      data.email,
      data.address,
      passwordHash
    ]

    const results = await db.query(query, values)

    return results.rows[0].id
  }
}