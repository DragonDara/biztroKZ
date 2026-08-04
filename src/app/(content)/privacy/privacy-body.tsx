import type { ReactNode } from "react"
import type { AppLocale } from "@/i18n/routing"
import Link from "next/link"

export function getPrivacyMeta(locale: AppLocale) {
  if (locale === "en") {
    return {
      title: "Privacy policy",
      description:
        "Biztro privacy policy. Learn how we collect, use, and disclose personal information through our online platform."
    }
  }
  if (locale === "es") {
    return {
      title: "Política de privacidad",
      description:
        "Política de privacidad de Biztro. Aprende cómo recopilamos, usamos y divulgamos información personal a través de nuestra plataforma en línea."
    }
  }
  return {
    title: "Политика конфиденциальности",
    description:
      "Политика конфиденциальности Biztro. Узнайте, как мы собираем, используем и раскрываем персональные данные через нашу онлайн-платформу."
  }
}

export function PrivacyBody({
  locale,
  application
}: {
  locale: AppLocale
  application: string
}) {
  if (locale === "en") {
    return <PrivacyEn application={application} />
  }
  if (locale === "es") {
    return <PrivacyEs application={application} />
  }
  return <PrivacyRu application={application} />
}

function EffectiveDate({ children }: { children: ReactNode }) {
  return <h2 className="font-medium text-gray-500">{children}</h2>
}

function PrivacyRu({ application }: { application: string }) {
  return (
    <>
      <h1>Политика конфиденциальности</h1>
      <EffectiveDate>Действует с 1 июня 2024 г.</EffectiveDate>
      <ol>
        <li>
          <p>
            <strong>Введение.</strong> Настоящая Политика конфиденциальности
            (далее — <strong>«Политика»</strong>) объясняет, как {application}{" "}
            Software («{application}») собирает, использует и раскрывает
            персональные данные через свою онлайн-платформу (далее —
            «Платформа»). Используя Платформу любым способом, вы подтверждаете,
            что принимаете практики и правила, описанные в этой Политике, и
            соглашаетесь на сбор, использование и передачу ваших персональных
            данных указанными способами. Термины с заглавной буквы, не
            определённые в этой Политике, определены в наших{" "}
            <Link href="/terms" prefetch={false}>
              Условиях обслуживания
            </Link>
            .
          </p>
        </li>
        <li>
          <p>
            <strong>Какие данные мы собираем и как используем.</strong> Как
            описано ниже, вы можете предоставить нам определённые персональные
            данные. Кроме того, мы можем автоматически собирать информацию при
            использовании Платформы. Мы используем эти данные, чтобы
            предоставлять вам и вашим Организациям функции Платформы, улучшать
            её и информировать о Платформе. Ниже подробнее о собираемых данных и
            целях их использования.
          </p>
          <ol>
            <li>
              <p>
                <strong>Данные, предоставленные добровольно.</strong>
              </p>
              <ol>
                <li>
                  <strong>Создание учётной записи.</strong> Для создания учётной
                  записи на Платформе вы предоставляете информацию через
                  стороннего аутентификатора. Как минимум это имя и адрес
                  электронной почты; при желании можно добавить фотографию. Мы
                  используем эти данные, чтобы предоставить доступ к Платформе,
                  исполнять договор с вами и связываться по вопросам учётной
                  записи и учётных записей Организаций, с которыми вы связаны.
                  Также мы можем использовать ваш email для рекламных сообщений
                  о Платформе и услугах {application}. Вы соглашаетесь на
                  получение таких сообщений.
                </li>
                <li>
                  <strong>Публикации и комментарии.</strong> Вы можете
                  публиковать контент и текст на Платформе и комментировать
                  материалы других пользователей внутри Организаций (совместно —
                  «Пользовательский контент»). Если вы или Организации
                  используют сторонние приложения с Платформой, вы можете
                  публиковать Пользовательский контент из этих приложений.
                </li>
              </ol>
            </li>
            <li>
              <p>
                <strong>Данные, собираемые автоматически.</strong>
              </p>
              <ol>
                <li>
                  <strong>Данные браузера и устройства.</strong> При каждом
                  взаимодействии с Платформой мы автоматически получаем и
                  записываем в журналы сервера сведения из браузера или
                  устройства: IP-адрес, геолокацию, идентификатор устройства,
                  данные cookie, тип устройства, время на Платформе и
                  запрошенную страницу или функцию. Мы используем эти данные для
                  персонализации контента и анализа использования, а также для
                  улучшения Платформы — например, чтобы понять, как часто
                  применяется определённая функция.
                </li>
                <li>
                  <strong>Электронные письма.</strong> Мы можем получать
                  подтверждение, когда вы открываете наше письмо.
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <strong>Раскрытие информации.</strong> Мы можем раскрывать ваши
            персональные данные следующим категориям получателей.
          </p>
          <ol>
            <li>
              <strong>Сотрудники и сторонние поставщики услуг.</strong> Мы
              нанимаем персонал и привлекаем компании и подрядчиков для задач от
              нашего имени и можем делиться персональными данными, чтобы
              предоставлять продукты или услуги. Например, мы используем
              Cloudflare для хранения видео и изображений, которые пользователи
              публикуют на Платформе.
            </li>
            <li>
              <strong>Доступ Организации.</strong> Если вы отправляете
              персональные данные или Пользовательский контент в часть
              Платформы, доступную другим пользователям Организации, они могут
              видеть эти сведения. Указывайте только ту информацию, которой
              готовы делиться с другими пользователями Организации.
            </li>
            <li>
              <strong>Сторонние приложения.</strong> Если вы или Организация
              используете сторонние приложения внутри Платформы, {application}{" "}
              может предоставить внешним поставщикам доступ к персональным
              данным и Пользовательскому контенту, необходимый для
              взаимодействия приложений с Платформой. Использование данных
              внешним поставщиком регулируется соглашением между Организацией и
              поставщиком либо между вами и поставщиком. {application} не несёт
              ответственности за доступ или использование ваших данных третьими
              лицами. Решение о предоставлении доступа принимаете вы и
              Организации.
            </li>
            <li>
              <strong>Передача бизнеса.</strong> При приобретении нас (или наших
              активов), закрытии бизнеса, банкротстве или ином изменении
              контроля персональные данные могут быть среди передаваемых
              активов.
            </li>
            <li>
              <strong>Соблюдение закона.</strong> Мы оставляем за собой право
              получать доступ, сохранять и раскрывать любую информацию,
              необходимую для выполнения запросов госорганов, законов или
              судебных решений, а также для обеспечения соблюдения наших Условий
              обслуживания и иных соглашений.
            </li>
          </ol>
        </li>
        <li>
          <p>
            <strong>Безопасность.</strong> Мы применяем коммерчески разумные
            физические, административные и технические меры для защиты
            целостности и безопасности персональных данных. Также мы опираемся
            на технические меры сторонних поставщиков, у которых размещаются и
            обрабатываются данные. Однако мы не можем гарантировать, что к
            данным на Платформе нельзя будет получить доступ, раскрыть, изменить
            или уничтожить их в обход наших мер защиты. Мы не несём
            ответственности перед пользователями или третьими лицами за такие
            утраты, неправомерное использование или изменение.
          </p>
        </li>
        <li>
          <p>
            <strong>Ваши права.</strong> Поскольку мы собираем персональные
            данные в рамках Соглашений с Организациями, мы выступаем
            «обработчиком» этих данных, а Организации определяют цели и способы
            обработки. Вопросы о обработке данных или осуществление прав
            субъекта данных (включая изменение и удаление) следует направлять в
            соответствующие Организации. Мы поможем Организациям рассмотреть
            такие обращения в соответствии с Соглашениями и применимым правом.
          </p>
          <p>
            С учётом права запросить удаление данных мы храним персональные
            данные столько, сколько необходимо для использования Платформы,
            согласованной маркетинговой коммуникации, исполнения юридических
            обязательств и защиты наших или чужих интересов.
          </p>
        </li>
        <li>
          <p>
            <strong>Как мы реагируем на сигналы Do Not Track.</strong> Мы не
            отслеживаем и не собираем персональные данные через сторонние сайты
            или онлайн-сервисы. Поэтому мы не получаем сигналы Do Not Track и
            аналогичные. Если такие сигналы будут получены, мы их не выполняем,
            поскольку это не входит в функциональность Платформы.
          </p>
        </li>
        <li>
          <strong>Изменения Политики.</strong> Мы постоянно улучшаем Платформу,
          поэтому Политика может меняться. Дата последнего изменения публикуется
          в начале Политики. Вы обязаны периодически проверять обновления.
          Продолжая использовать Платформу, вы соглашаетесь с изменённой
          Политикой.
        </li>
      </ol>
    </>
  )
}

function PrivacyEn({ application }: { application: string }) {
  return (
    <>
      <h1>Privacy policy</h1>
      <EffectiveDate>Effective as of June 1, 2024</EffectiveDate>
      <ol>
        <li>
          <p>
            <strong>Introduction.</strong> This Privacy Policy (the{" "}
            <strong>&quot;Policy&quot;</strong>) explains how {application}{" "}
            Software (&quot;{application}&quot;) collects, uses, and discloses
            personal information through its online platform (the
            &quot;Platform&quot;). By using or accessing the Platform in any
            way, you acknowledge that you accept the practices described in this
            Policy and agree that we may collect, use, and share your personal
            information as described. Capitalized terms not defined here are
            defined in our{" "}
            <Link href="/terms" prefetch={false}>
              Terms of Service
            </Link>
            .
          </p>
        </li>
        <li>
          <p>
            <strong>Information collected and how we use it.</strong> As
            explained below, you may provide certain personal information. We
            may also collect information automatically through your use of the
            Platform. We use this information to provide Platform functionality
            to you and your Organizations, improve the Platform, and share
            information about it.
          </p>
          <ol>
            <li>
              <p>
                <strong>Information you provide voluntarily.</strong>
              </p>
              <ol>
                <li>
                  <strong>Account creation.</strong> To create an account you
                  provide information through a third-party authenticator. This
                  includes at least your name and email address, and optionally
                  a photo. We use this to give you Platform access, perform our
                  contract with you, and communicate about your account and
                  Organization accounts. We may also use your email for
                  promotional messages about the Platform and {application}{" "}
                  services. You agree to receive those emails.
                </li>
                <li>
                  <strong>Posts and comments.</strong> You may post content and
                  text on the Platform and comment on content posted by other
                  users within Organizations (collectively, &quot;User
                  Content&quot;). If you or Organizations use third-party apps
                  with the Platform, you may post User Content from those apps.
                </li>
              </ol>
            </li>
            <li>
              <p>
                <strong>Information collected automatically.</strong>
              </p>
              <ol>
                <li>
                  <strong>Browser and device information.</strong> Each time you
                  interact with the Platform we automatically log information
                  from your browser or device, which may include IP address,
                  geolocation, device ID, cookie data, device type, time spent,
                  and the page or feature requested. We use this to personalize
                  content, analyze usage, and improve the Platform.
                </li>
                <li>
                  <strong>Emails.</strong> We may receive confirmation when you
                  open an email from us.
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <strong>Disclosure of information.</strong> We may disclose personal
            information to the categories of third parties identified below.
          </p>
          <ol>
            <li>
              <strong>Staff and third-party service providers.</strong> We
              employ staff and engage companies to perform tasks on our behalf
              and may share personal information as needed to provide products
              or services. For example, we use Cloudflare to store videos and
              images users post on the Platform.
            </li>
            <li>
              <strong>Organization access.</strong> If you submit personal
              information or User Content to a Platform area accessible by other
              Organization users, those users may see it. Include only
              information you are comfortable sharing with them.
            </li>
            <li>
              <strong>Third-party applications.</strong> If you or an
              Organization use third-party apps within the Platform,{" "}
              {application} may allow external providers to access personal
              information and User Content as needed for interoperability. Their
              use is governed by the applicable agreement with that provider.{" "}
              {application} is not responsible for third-party access or use.
            </li>
            <li>
              <strong>Business transfers.</strong> If we (or our assets) are
              acquired, or if we close, enter bankruptcy, or undergo another
              change of control, personal information may be among transferred
              assets.
            </li>
            <li>
              <strong>Legal compliance.</strong> We may access, preserve, and
              disclose information as needed to comply with government requests,
              laws, or court orders, or to enforce our Terms of Service and
              other agreements.
            </li>
          </ol>
        </li>
        <li>
          <p>
            <strong>Security.</strong> We use commercially reasonable physical,
            administrative, and technical measures to protect personal
            information and rely on safeguards from hosting providers. We cannot
            guarantee that personal information on the Platform cannot be
            accessed, disclosed, altered, or destroyed despite those safeguards.
            We are not liable for such loss, misuse, or alteration.
          </p>
        </li>
        <li>
          <p>
            <strong>Your rights.</strong> Because we collect personal
            information under Organization Agreements, we act as a
            &quot;processor&quot; and Organizations determine how and why we
            process it. Questions about handling of your data or exercising data
            subject rights should go to the relevant Organizations. We will
            assist Organizations as required by those agreements and applicable
            law.
          </p>
          <p>
            Subject to your right to request deletion, we retain personal
            information as needed for Platform use, approved marketing, legal
            obligations, and protecting our or others&apos; interests.
          </p>
        </li>
        <li>
          <p>
            <strong>Do Not Track signals.</strong> We do not track or collect
            personal information across third-party websites or online services.
            We therefore do not receive Do Not Track or similar signals. If we
            receive them, we do not honor them because that is not part of
            Platform functionality.
          </p>
        </li>
        <li>
          <strong>Policy changes.</strong> We continually improve the Platform,
          so this Policy may change. The date of the latest modification appears
          at the top. Continued use of the Platform means you accept the
          modified Policy.
        </li>
      </ol>
    </>
  )
}

function PrivacyEs({ application }: { application: string }) {
  return (
    <>
      <h1>Política de privacidad</h1>
      <EffectiveDate>A partir del 1 de junio de 2024</EffectiveDate>
      <ol>
        <li>
          <p>
            <strong>Introducción.</strong> Esta Política de Privacidad (la{" "}
            <strong>&quot;Política&quot;</strong> ) explica cómo {application}{" "}
            Software (&quot;{application}&quot;) recopila, utiliza y divulga
            información personal a través de su plataforma en línea (la
            &quot;Plataforma&quot;). Al usar o acceder a la Plataforma de
            cualquier manera, usted reconoce que acepta las prácticas y
            políticas descritas en esta Política y, por la presente, acepta que
            recopilemos, usemos y compartamos su información personal de las
            siguientes maneras. Cualquier término en mayúscula que no esté
            definido en esta Política se define en nuestros{" "}
            <Link href="/terms" prefetch={false}>
              Términos de servicio
            </Link>{" "}
            .
          </p>
        </li>
        <li>
          <p>
            <strong>Información recopilada y cómo la utilizamos.</strong> Como
            se explica más adelante en esta sección, tendrá la oportunidad de
            proporcionarnos cierta información personal. Además, podemos
            recopilar cierta información automáticamente a través de su uso de
            la Plataforma. Utilizaremos esta información para brindarle a usted
            y a sus Organizaciones la funcionalidad de nuestra Plataforma, para
            mejorarla y para brindarle información sobre nuestra Plataforma. El
            resto de esta sección proporciona una explicación más detallada de
            la información personal que recopilamos y cómo utilizamos esa
            información.
          </p>
          <ol>
            <li>
              <p>
                <strong>Información divulgada voluntariamente.</strong>
              </p>
              <ol>
                <li>
                  <strong>Creación de cuenta.</strong> Para crear su cuenta en
                  la Plataforma, deberá proporcionar información a través de un
                  Autenticador de terceros. Esta información incluirá, como
                  mínimo, su nombre, dirección de correo electrónico y podrá
                  proporcionar una fotografía si así lo desea. Usamos esta
                  información para poder brindarle acceso a la Plataforma,
                  ejecutar nuestro contrato con usted y comunicarnos con usted
                  sobre su cuenta y las cuentas de las Organizaciones a las que
                  está afiliado en la Plataforma. Además, podremos utilizar su
                  dirección de correo electrónico para enviarle correos
                  electrónicos promocionales sobre la Plataforma y los servicios
                  de {application}. Por la presente usted acepta la recepción de
                  estos correos electrónicos promocionales.
                </li>
                <li>
                  <strong>Publicaciones y comentarios.</strong> Tendrá la opción
                  de publicar contenido y texto en la Plataforma, y ​​de
                  comentar el contenido y el texto que otros usuarios dentro de
                  las Organizaciones publiquen en la Plataforma (colectivamente,
                  &quot;Contenido de Usuario&quot;). Si usted o las
                  Organizaciones eligen utilizar Aplicaciones de terceros en
                  relación con la Plataforma, podrá publicar Contenido de
                  usuario en la Plataforma desde esas Aplicaciones de terceros.
                </li>
              </ol>
            </li>
            <li>
              <p>
                <strong>Información recopilada automáticamente.</strong>
              </p>
              <ol>
                <li>
                  <strong>Información del navegador y del dispositivo.</strong>{" "}
                  Cada vez que interactúa con la Plataforma, recibimos y
                  registramos automáticamente información en los registros de
                  nuestro servidor desde su navegador o dispositivo, que puede
                  incluir su dirección IP, datos de geolocalización,
                  identificación del dispositivo, información de
                  &quot;cookies&quot;, el tipo de dispositivo que está
                  utilizando para acceder a la Plataforma, la cantidad de tiempo
                  que pasa en la Plataforma y la página o función que solicitó.
                  Utilizamos los datos que recopilamos automáticamente sobre
                  usted para personalizar el contenido que creemos que podría
                  gustarle, analizar sus patrones de uso. También podemos
                  usarlos para mejorar la Plataforma; por ejemplo, estos datos
                  pueden decirnos con qué frecuencia los usuarios usan una
                  característica particular de la Plataforma, y ​​podemos usar
                  ese conocimiento para hacer que la Plataforma sea interesante
                  para la mayor cantidad de usuarios posible.
                </li>
                <li>
                  <strong>Correos electrónicos.</strong> Es posible que
                  recibamos una confirmación cuando abra un correo electrónico
                  nuestro.
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <strong>Revelación de información.</strong> Podemos divulgar su
            información personal a las categorías de terceros identificadas en
            esta sección.
          </p>
          <ol>
            <li>
              <strong>Personal y Terceros Proveedores de Servicios.</strong>{" "}
              Empleamos personal y contratamos a otras empresas y personas para
              que realicen tareas en nuestro nombre y necesitamos compartir su
              información personal con ellos para proporcionarle productos o
              servicios. Por ejemplo, utilizamos los servicios web de Cloudflare
              para almacenar vídeos e imágenes que los usuarios publican en la
              Plataforma.
            </li>
            <li>
              <strong>Acceso a la organización.</strong> Tenga en cuenta que si
              envía información personal o Contenido de usuario a una parte de
              la Plataforma a la que pueden acceder otros usuarios dentro de una
              Organización, otros usuarios afiliados a la Organización podrán
              ver esa información personal y Contenido de usuario. En
              consecuencia, incluya únicamente información personal en dichos
              envíos que se sienta cómodo compartiendo con otros usuarios
              afiliados a la Organización.
            </li>
            <li>
              <strong>Aplicaciones de terceros.</strong> Si usted o una
              Organización utilizan Aplicaciones de terceros dentro de la
              Plataforma, {application} permitirá que los Proveedores externos
              accedan o utilicen su información personal y Contenido de usuario
              según sea necesario para la interoperabilidad de las Aplicaciones
              de terceros y la Plataforma. El uso de su información personal y
              Contenido de usuario por parte de cualquier Proveedor externo está
              sujeto al acuerdo aplicable entre (i) la Organización aplicable y
              dicho Proveedor externo, o (ii) usted y el Proveedor externo.
              {application} no es responsable del acceso o uso de su información
              personal o Contenido de usuario por parte de terceros proveedores.
              Usted y las Organizaciones son los únicos responsables de la
              decisión de permitir que cualquier proveedor externo utilice su
              información personal o Contenido de usuario.
            </li>
            <li>
              <strong>Transferencias de Negocios.</strong> Si nosotros (o
              nuestros activos) somos adquiridos, o si cerramos el negocio,
              entramos en quiebra o pasamos por algún otro cambio de control, la
              información personal podría ser uno de los activos transferidos o
              adquiridos por un tercero.
            </li>
            <li>
              <strong>Cómplice legal.</strong> Nos reservamos el derecho de
              acceder, leer, preservar y divulgar cualquier información que
              consideremos necesaria para cumplir con solicitudes
              gubernamentales, leyes u órdenes judiciales, o hacer cumplir o
              aplicar nuestros Términos de servicio y otros acuerdos.
            </li>
          </ol>
        </li>
        <li>
          <p>
            <strong>Seguridad.</strong> Utilizamos medidas de seguridad físicas,
            administrativas y técnicas comercialmente razonables para preservar
            la integridad y seguridad de su información personal. Además,
            confiamos en las salvaguardas técnicas proporcionadas por los
            proveedores de servicios externos que utilizamos para alojar,
            almacenar y procesar su información personal. Sin embargo, no
            podemos asegurar ni garantizar que no se pueda acceder a su
            información personal en la Plataforma, divulgarla, alterarla o
            destruirla por incumplimiento de cualquiera de nuestras
            salvaguardias físicas, técnicas o administrativas. No somos
            responsables ante nuestros usuarios ni ante terceros debido a dicha
            pérdida, mal uso o alteración.
          </p>
        </li>
        <li>
          <p>
            <strong>Tus derechos.</strong> Debido a que hemos recopilado su
            información personal como resultado de los Acuerdos de Organización,
            somos un &quot;procesador&quot; de su información personal y las
            Organizaciones controlan nuestro uso de su información personal y
            determinan cómo y con qué propósito procesamos su información
            personal. Si tiene alguna pregunta o inquietud sobre cómo se maneja
            su información personal o desea ejercer los derechos que pueda tener
            como interesado (incluida la modificación y eliminación de su
            información personal), debe comunicarse con las Organizaciones
            correspondientes. Brindaremos asistencia a las Organizaciones para
            abordar cualquier inquietud que pueda tener, de acuerdo con los
            términos de los Acuerdos de la Organización y la ley aplicable.
          </p>
          <p>
            Sujeto a su derecho a solicitar la eliminación de su información
            personal, conservaremos su información personal durante el tiempo
            que sea necesario para su uso de la Plataforma, la recepción
            aprobada de nuestras comunicaciones de marketing, nuestro
            cumplimiento de las obligaciones legales y para proteger la nuestra
            o la de otros. intereses.
          </p>
        </li>
        <li>
          <p>
            <strong>Cómo respondemos a las señales de No rastrear.</strong> No
            lo rastreamos ni recopilamos su información personal a través de
            sitios web o servicios en línea de terceros. Por lo tanto, no
            recibimos señales de No seguimiento ni otras señales similares. En
            la medida en que recibamos dichas señales, no las cumpliremos ya que
            no es un aspecto de la funcionalidad de la Plataforma.
          </p>
        </li>
        <li>
          <strong>Cambios en la política.</strong> Intentamos constantemente
          mejorar la Plataforma, por lo que es posible que también debamos
          cambiar esta Política de vez en cuando. La fecha de la última
          modificación también se publicará al inicio de esta Política. Es su
          responsabilidad comprobar periódicamente si hay actualizaciones. Al
          continuar accediendo o utilizando la Plataforma, usted indica que
          acepta estar sujeto a la Política modificada.
        </li>
      </ol>
    </>
  )
}
