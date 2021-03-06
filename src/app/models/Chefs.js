const db = require('../../config/db')
const { date } = require('../../lib/utils')
const fs = require('fs')

module.exports = {
    async all() {
        const results = await db.query(`SELECT * FROM chefs`)

        return results.rows
    },
    filter(filter, callback) {
        db.query(`SELECT * FROM chefs WHERE chefs.name ILIKE '%${filter}%'`,
            (err, results) => {
                if (err) throw `${err}`

                callback(results.rows)
            })
    },
    create(data, file_id) {
        const query = `
        INSERT INTO chefs (
            name,
            created_at,
            file_id
        ) VALUES ($1, $2, $3)
        RETURNING id
        `

        const values = [
            data.name,
            date(Date.now()).created,
            file_id
        ]

        return db.query(query, values)
    },
    async find(id) {
        try {
            const results = await db.query(`SELECT chefs.*, 
            count(recipes) AS total_recipes
            FROM chefs 
            LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
            WHERE chefs.id = $1
            GROUP BY chefs.id
            `, [id])

            return results.rows[0]
        } catch (err) {
            console.log(err)
        }
    },
    update(data, file_id) {
        const query = ` 
        UPDATE chefs SET
        name=($1),
        file_id=($2)
        WHERE id = $3 
        `

        const values = [
            data.name,
            file_id,
            data.id
        ]

        return db.query(query, values)
    },
    async delete(id) {
        try {
            await db.query(`DELETE FROM chefs WHERE id = $1`, [id])

            const results = await db.query(`
            SELECT files.* FROM files
            LEFT JOIN chefs ON (chefs.file_id = files.id)
            WHERE chefs.id = $1`, [id])
            const file = results.rows

            file.map(async file => {
                fs.unlinkSync(file.path)

                await db.query(`DELETE FROM files 
                WHERE id = $1`, [file.id])
            })
        } catch (err) {
            console.log(err)
        }
    },
    async paginate(params) {
        let { filter, limit, offset } = params

        let query = '',
            filterQuery = '',
            totalQuery = `(
                SELECT count(*)
                FROM chefs 
            ) AS total`

        if (filter) {
            filterQuery = `
                WHERE chefs.name ILIKE '%${filter}%'
            `

            totalQuery = `(
                SELECT count(*)
                FROM chefs 
                ${filterQuery}
            ) AS total`
        }

        query = `
        SELECT chefs.*,
        ${totalQuery}
        FROM chefs 
        ${filterQuery}
        LIMIT $1 OFFSET $2
        `

        const results = await db.query(query, [limit, offset])

        return results.rows
    },
    async files(id) {
        try {
            const results = await db.query(`SELECT files.path FROM files WHERE files.id = $1 `, [id])

            return results.rows
        } catch (err) {
            console.log(err);
        }
    },
    chefFiles(id) {
        const query = `
        SELECT *, (
            SELECT files.path
            FROM files
            LEFT JOIN recipe_files 
            ON (files.id = recipe_files.file_id)
            WHERE recipe_files.recipe_id = $1
            LIMIT 1
            ) 
        FROM recipes 
        LEFT JOIN recipe_files ON 
        (recipes.id = recipe_files.recipe_id)
        WHERE recipes.id = $1
        LIMIT 1
        `

        return db.query(query, [id])
    },
    async getChefAvatar(id) {
        try {
            const results = await db.query(`
        SELECT files.*
        FROM files 
        LEFT JOIN chefs ON 
        (chefs.file_id = files.id)
        WHERE chefs.id = $1
        `, [id])

            return results.rows[0]
        } catch (err) {
            console.log(err)
        }
    },
    async findChefRecipes(id) {
        try {
            const results = await db.query(`
            SELECT *
            FROM chefs 
            LEFT JOIN recipes
            ON (recipes.chef_id = chefs.id) 
            WHERE chefs.id = $1
            `, [id])

            return results.rows
        } catch (err) {
            console.log(err)
        }
    }
}
