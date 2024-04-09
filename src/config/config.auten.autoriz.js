// autorizacion de acceso a perfil luego de login
export const auth2 = (req, res, next) => {
    if (req.session.usuario) {
        res.status(401).redirect('/perfil'); 
        return;
    }

    next();
};

// autorizacion de acceso a login luego de registro
export const auth = (req, res, next) => {
    if (!req.session.usuario) {
        res.status(401).redirect('/login'); 
        return;
    }

    next();
};

// autorizacion si sos administrador
export const isAdmin = (req, res, next) => {
    if (req.session.rol === 'administrador' ) {
      return;
    } 
    next();
  };

//   autorizacion si sos usuario
export const isUsuario = (req, res, next) => {
    if (req.session.rol === 'usuario') {
      return;
    } 
    next();
};

export const isAdminOrPremium = (req, res, next) => {
  if (req.session.rol === 'administrador' || req.session.rol === 'premium') {
    return;
  } 
  next();
};