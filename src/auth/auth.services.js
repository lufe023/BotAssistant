const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

const { loginUser } = require("./auth.controller");

const login = (req, res) => {
    const { email, password } = req.body;

    //! if(!email || !password) return res.status(400).json({message: 'Missing Data'})

    if (email && password) {
        loginUser(email, password)
            .then((response) => {
                if (response) {
                    const token = jwt.sign(
                        {
                            id: response.id,
                            email: response.email,
                            role: response.user_role.level,
                        },
                        jwtSecret
                    );

                    res.status(200).json({
                        message: "Correct Credentials",
                        token,
                        id: response.id,
                        usuario: response.usuario,
                        nivel: response.user_role.level,
                    });
                } else {
                    res.status(401).json({
                        message: "Credenciales incorrectas",
                    });
                }
            })
            .catch((error) => {
                res.status(400).json({ message: error.message });
            });
    } else {
        res.status(400).json({ message: "Missing Data" });
    }
};

module.exports = {
    login,
};
