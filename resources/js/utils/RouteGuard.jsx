import React from 'react';

export class RouteGuard extends React.Component {
  constructor(props) {
    super(props);

    // 1) Validamos YA aquí, sincronamente
    const allowed = RouteGuard.check(props.filteredSections);

    // 2) Si no está permitido, redirigimos antes de montar hijos
    if (!allowed) {
      window.location.href = '/notFound';    // redirección pura JS
    }

    // 3) Guardamos en estado para el render limpio
    this.state = { allowed };
  }

  // Método estático reusable
  static check(filteredSections) {
    const path = window.location.pathname;
    const allowedPaths = filteredSections.flatMap(sec =>
      sec.options.map(opt =>
        opt.to.replace(/\/{2,}/g, '/')
      )
    );
    return allowedPaths.some(route =>
      path.startsWith(route)
    );
  }

  render() {
    // 4) Bloqueamos el render de hijos si no está permitido
    if (!this.state.allowed) {
      return null;
    }
    return this.props.children;
  }
}
