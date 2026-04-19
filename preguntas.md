# Preguntas - Proyecto 3 (SmartLog Monitor)
 
## Empresa de referencia: TecnoPlanta S.A.
 
TecnoPlanta S.A. es una empresa industrial mediana (250 empleados) dedicada a la fabricación de componentes electrónicos para el sector automoción. Cuenta con una planta de producción en Valencia y oficinas centrales en Madrid. Gestiona entornos IT (ERP, CRM, correo corporativo, red) y OT (líneas de ensamblaje automatizadas, sensores IoT, PLCs y cámaras de control de calidad). Históricamente, la gestión de incidencias se realizaba por email y WhatsApp, sin trazabilidad, SLA ni control centralizado.
 
---
 
## Criterio 6a) Objetivos estratégicos
 
### ¿Qué objetivos estratégicos específicos de la empresa aborda tu software?
 
TecnoPlanta S.A. tiene como objetivos estratégicos para el período 2025-2027:
 
1. **Reducir el tiempo medio de resolución de incidencias** en un 40% para mantener la continuidad operativa de la línea de producción.
2. **Eliminar la dependencia de canales informales** (email, WhatsApp) para la comunicación de fallos técnicos.
3. **Cumplir con los requisitos de auditoría ISO 9001** — toda acción correctiva debe estar documentada y trazada.
4. **Preparar la infraestructura tecnológica** para una futura integración con el ERP SAP y el sistema MES de planta.
SmartLog Monitor aborda directamente los tres primeros: centraliza la operación de incidencias, elimina los canales informales mediante un flujo estructurado, y proporciona trazabilidad completa (timeline por incidencia, log de auditoría global) que cumple los requisitos de registro de ISO 9001.
 
### ¿Cómo se alinea el software con la estrategia general de digitalización?
 
La estrategia de digitalización de TecnoPlanta S.A. sigue un modelo por fases: primero estandarizar procesos operativos, luego integrarlos con sistemas de terceros, y finalmente incorporar analítica avanzada e IA. SmartLog Monitor encaja en la **fase 1** (estandarización): define un flujo único de incidencias con estados, roles y evidencias, creando la base de datos operativa que las fases posteriores necesitarán. La arquitectura modular del software (separación entre lógica, persistencia y configuración) está pensada para facilitar la evolución hacia backend cloud en la fase 2.
 
---
 
## Criterio 6b) Áreas de negocio y comunicaciones
 
### ¿Qué áreas de la empresa se ven más beneficiadas con tu software?
 
- **Producción / OT**: es el área de mayor impacto. Las incidencias de planta (sensores IoT, equipos, fallos de línea) tienen consecuencias directas en productividad. Con SmartLog Monitor, cada fallo queda registrado, asignado a un técnico OT y seguido hasta su cierre, con SLA visible.
- **IT / Soporte técnico**: gestiona incidencias de aplicaciones, red y servidores. El flujo estructurado por equipos (N1, N2, Infra) sustituye las bandejas de correo desordenadas.
- **Dirección / Supervisión**: accede a dashboards con el estado real de incidencias, carga por técnico y tiempos de resolución — información que antes no existía de forma consolidada.
- **Calidad (QA)**: el rol auditor permite revisar toda la trazabilidad sin intervenir en el flujo, facilitando auditorías internas y externas.
### ¿Qué impacto operativo esperas en las operaciones diarias?
 
- Reducción del tiempo de asignación de incidencias: de horas (por email) a minutos (notificación directa en bandeja del técnico).
- Eliminación de incidencias "perdidas": el sistema impide cerrar una incidencia sin confirmación del reportante.
- Visibilidad de carga de trabajo por técnico y equipo, permitiendo redistribución proactiva.
- Registro automático de tiempos (creación, asignación, resolución, cierre) que alimenta KPIs operativos.
- Reducción de errores por comunicación informal: el campo de comentarios y evidencias en cada transición obliga a documentar el trabajo realizado.
---
 
## Criterio 6c) Áreas susceptibles de digitalización
 
### ¿Qué áreas de la empresa son más susceptibles de ser digitalizadas con tu software?
 
1. **Gestión de incidencias OT** — actualmente gestionada por walkie-talkie y papel. Con SmartLog Monitor, cada operario puede reportar un fallo desde cualquier dispositivo y el supervisor de planta ve el estado en tiempo real.
2. **Soporte IT de primer nivel (N1/N2)** — hoy en bandejas de correo individuales sin SLA ni visibilidad compartida.
3. **Control de calidad** — los fallos de proceso detectados en auditoría interna pueden registrarse como incidencias de tipo "Calidad", creando un historial trazable vinculado a acciones correctivas.
4. **Gestión de mantenimiento preventivo** — adaptando los tipos de incidencia se puede registrar también el mantenimiento programado, unificando correctivo y preventivo en un mismo sistema.
### ¿Cómo mejorará la digitalización las operaciones en esas áreas?
 
En producción OT, la digitalización elimina el "teléfono roto" entre operario, técnico y supervisor. En IT, permite medir por primera vez el rendimiento real del soporte (MTTR, volumen por equipo, recurrencia de fallos). En calidad, convierte los hallazgos de auditoría en registros buscables y exportables. En mantenimiento, permite predecir patrones de fallo a partir del histórico de incidencias.
 
---
 
## Criterio 6d) Encaje de áreas digitalizadas entre sí y con las que no lo están
 
### ¿Cómo interactúan las áreas digitalizadas y las no digitalizadas?
 
Las áreas más resistentes a la digitalización inmediata en TecnoPlanta S.A. son:
- **Operarios de línea**: usan dispositivos básicos y no están habituados a software de gestión.
- **Proveedores externos**: cuando una incidencia involucra un proveedor (ej. VPN corporativa, hardware externo), el flujo se rompe porque el proveedor no tiene acceso al sistema.
- **Almacén y logística**: gestionan sus propias incidencias de forma completamente manual.
Actualmente, las áreas digitalizadas (IT, supervisión) deben "traducir" la información que llega de las no digitalizadas para introducirla en SmartLog Monitor. Esto genera duplicación de trabajo y posibles pérdidas de información.
 
### ¿Qué soluciones o mejoras propondrías para integrar estas áreas?
 
1. **Portal de reporte simplificado**: una vista mínima (solo título, área y descripción) accesible desde cualquier dispositivo móvil, sin necesidad de login completo, para operarios de línea.
2. **Formulario público por enlace** para proveedores externos, que genere una incidencia sin acceso al sistema interno.
3. **Integración con WhatsApp Business API** — dado que los operarios ya usan WhatsApp, un bot sencillo puede crear incidencias directamente desde la conversación.
4. **Extensión al almacén**: crear un equipo "Almacén" en la configuración y formar a un responsable como supervisor de ese equipo.
---
 
## Criterio 6e) Necesidades presentes y futuras
 
### ¿Qué necesidades actuales de la empresa resuelve tu software?
 
| Necesidad actual | Cómo la resuelve SmartLog Monitor |
|---|---|
| Sin registro centralizado de incidencias | Base de datos única con historial completo |
| Sin trazabilidad de acciones | Timeline por incidencia con usuario, rol y timestamp |
| Sin control de prioridades | Campo de prioridad configurable + gestión por supervisor |
| Sin visibilidad de carga de técnicos | Vista de asignaciones por técnico y equipo |
| Sin auditoría para ISO 9001 | Log global exportable + rol auditor con acceso total |
| Incidencias "perdidas" en correo | Estados controlados + confirmación de cierre por reportante |
 
### ¿Qué necesidades futuras cubre el roadmap del proyecto?
 
- **Notificaciones automáticas** (email/webhook): cuando se asigna o escala una incidencia, el técnico es notificado sin necesidad de revisar manualmente el sistema.
- **SLA configurable con alertas**: definir tiempos máximos por severidad y recibir alertas cuando se aproximan.
- **Integración con ERP SAP**: exportar incidencias resueltas como órdenes de trabajo o registros de mantenimiento.
- **IA para clasificación automática**: en base al historial, el sistema puede sugerir equipo, técnico y prioridad al crear una nueva incidencia.
- **Analítica predictiva**: identificar equipos o áreas con patrones de fallo recurrente antes de que se produzca una parada de línea.
---
 
## Criterio 6f) Relación con tecnologías habilitadoras digitales
 
### ¿Qué tecnologías habilitadoras has empleado y cómo impactan en las áreas de la empresa?
 
| Tecnología habilitadora | Aplicación en SmartLog Monitor | Área impactada |
|---|---|---|
| **Cloud Computing** | Despliegue estático (GitHub Pages / Netlify); roadmap hacia backend cloud con PostgreSQL | IT, Producción |
| **Big Data / Analítica** | KPIs operativos (MTTR, volumen, recurrencia); dashboards de supervisión | Dirección, QA |
| **Ciberseguridad** | RBAC, validación de entradas, log de auditoría, separación de funciones | Todos |
| **IoT** | Las incidencias de origen IoT (sensores OT) son un tipo de incidencia nativo en el sistema | Producción OT |
| **Automatización** | Reglas de transición de estado, validación automática, futura automatización de asignación | IT, OT |
| **Inteligencia Artificial** (roadmap) | Clasificación y priorización automática de incidencias | IT, OT |
| **Integración de sistemas / API** (roadmap) | Conexión con ERP, MES, CMMS mediante API REST | Producción, IT |
 
### ¿Qué beneficios específicos aporta la implantación de estas tecnologías?
 
- **Cloud**: disponibilidad 24/7, acceso desde planta y oficina, sin dependencia de servidores locales.
- **Analítica**: la dirección puede tomar decisiones basadas en datos reales (¿qué equipo tiene más carga? ¿qué área genera más incidencias críticas?).
- **RBAC + auditoría**: reduce el riesgo de manipulación de registros y facilita la respuesta ante inspecciones de calidad.
- **Integración IoT**: cuando un sensor OT falla, el sistema puede recibir una incidencia automáticamente desde el sistema de monitorización, sin intervención manual.
---
 
## Criterio 6g) Brechas de seguridad
 
### ¿Qué posibles brechas de seguridad podrían surgir al implementar tu software?
 
1. **Escalada de privilegios**: un usuario con rol `reportante` podría intentar ejecutar acciones reservadas a `supervisor` manipulando llamadas directas a funciones JavaScript, ya que la versión actual es puramente cliente.
2. **Exposición de datos en localStorage**: los datos de incidencias (potencialmente con información sensible de planta) se almacenan en el navegador sin cifrado.
3. **Ausencia de autenticación real**: el sistema de login actual es una simulación — no hay contraseñas ni sesiones seguras.
4. **Inyección en campos de texto**: aunque existe sanitización básica, sin backend, la validación puede ser eludida.
5. **Acceso a adjuntos**: los nombres de adjuntos se almacenan pero no hay control de acceso sobre los ficheros físicos.
6. **Sin caducidad de sesión**: un equipo compartido podría quedar con sesión abierta indefinidamente.
### ¿Qué medidas concretas propondrías para mitigarlas?
 
| Brecha | Medida de mitigación |
|---|---|
| Escalada de privilegios | Validación de permisos en backend (no solo en cliente) |
| Exposición en localStorage | Migración a sesión servidor + cifrado de datos sensibles en reposo |
| Autenticación débil | JWT con expiración + 2FA para roles críticos (supervisor, admin, auditor) |
| Inyección en formularios | Sanitización y validación también en backend; Content Security Policy (CSP) |
| Acceso a adjuntos | Object storage con URLs firmadas y de corta duración (ej. AWS S3 presigned URLs) |
| Sin caducidad de sesión | Timeout de inactividad configurable (ej. 30 min) |
 
Adicionalmente, en producción se recomendaría: auditoría periódica de permisos, monitorización activa de intentos de acceso fallidos, y un plan de respuesta ante incidentes de seguridad.
 
---
 
## Criterio 6h) Tratamiento de datos y análisis
 
### ¿Cómo se gestionan los datos en tu software y qué metodologías utilizas?
 
El ciclo de vida del dato en SmartLog Monitor sigue estas fases:
 
1. **Captura**: datos introducidos por el usuario en formularios estructurados (título, descripción, origen, severidad, categoría, prioridad, equipo, adjunto).
2. **Validación**: el módulo `validation.js` aplica reglas de negocio antes de persistir cualquier dato (longitud mínima, valores permitidos mediante `Set`, sanitización de espacios y caracteres).
3. **Normalización**: la función `normalizeImportedIncident()` garantiza coherencia al importar datos externos, aplicando valores por defecto para campos opcionales.
4. **Persistencia**: `storage.js` gestiona la escritura/lectura en `localStorage` con serialización JSON. En producción, este módulo se reemplazaría por llamadas a una API REST.
5. **Trazabilidad append-only**: cada cambio de estado, asignación o comentario se añade al array `timeline` de la incidencia — nunca se sobreescriben entradas anteriores.
6. **Exportación**: los datos pueden exportarse como JSON con metadatos (versión, fecha de generación).
7. **Cierre y conservación**: las incidencias cerradas se conservan para auditoría e histórico. La política de retención y eventual anonimización se aplicaría en la capa backend de producción.
### ¿Qué haces para garantizar la calidad y consistencia de los datos?
 
- **IDs únicos por incidencia** — generados con `crypto.randomUUID()` para evitar colisiones.
- **Conjuntos de valores permitidos** — origen, severidad, prioridad, categoría y equipo son validados contra `Set` fijos, impidiendo valores arbitrarios.
- **Transiciones de estado controladas** — el sistema solo permite transiciones válidas según el rol y el estado actual, evitando estados incoherentes.
- **Timestamps ISO 8601** — todos los eventos de timeline usan formato estándar para consistencia.
- **Validación en importación** — `normalizeImportedIncident()` rechaza registros con campos obligatorios inválidos, devolviendo `null` en lugar de persistir datos corruptos.
- **Registro de autoría** — cada entrada del timeline incluye `by: "rol:id"`, garantizando que todo cambio tiene un responsable identificado.
