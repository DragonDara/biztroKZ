import type { ReactNode } from "react"
import type { AppLocale } from "@/i18n/routing"
import Link from "next/link"

export function getTermsMeta(locale: AppLocale) {
  if (locale === "en") {
    return {
      title: "Terms of use",
      description: "Terms of use for the Biztro application."
    }
  }
  if (locale === "es") {
    return {
      title: "Términos de uso",
      description: "Términos de uso de la aplicación Biztro."
    }
  }
  return {
    title: "Условия использования",
    description: "Условия использования приложения Biztro."
  }
}

export function TermsBody({
  locale,
  application
}: {
  locale: AppLocale
  application: string
}) {
  if (locale === "en") {
    return <TermsEn application={application} />
  }
  if (locale === "es") {
    return <TermsEs application={application} />
  }
  return <TermsRu application={application} />
}

function EffectiveDate({ children }: { children: ReactNode }) {
  return <h2 className="font-medium text-gray-500">{children}</h2>
}

function TermsRu({ application }: { application: string }) {
  return (
    <>
      <h1>Условия использования</h1>
      <EffectiveDate>Действуют с 1 июня 2024 г.</EffectiveDate>
      <ol>
        <li>
          <p>
            <strong>Соглашение.</strong> Настоящие Условия обслуживания (далее —{" "}
            <strong>«Условия»</strong>) представляют собой обязательное
            соглашение между вами и {application} Software (
            <strong>«{application}»</strong>, <strong>«мы»</strong>,{" "}
            <strong>«наш»</strong> и <strong>«нас»</strong>), оператором
            платформы {application} (далее — <strong>«Платформа»</strong>). Эти
            Условия определяют правила доступа к Платформе и её использования.
          </p>
          <p>
            Получая доступ к Платформе или используя её любым способом, вы
            соглашаетесь соблюдать настоящие Условия.
          </p>
          <p>
            Вы получаете доступ к Платформе и используете её от имени одной или
            нескольких организаций, с которыми вы связаны (каждая —{" "}
            <strong>«Организация»</strong>). {application} и каждая Организация
            заключили отдельное соглашение (далее —{" "}
            <strong>«Соглашение с Организацией»</strong>), регулирующее
            предоставление услуг {application} этой Организации. Настоящие
            Условия не изменяют условия Соглашений с Организациями. В случае
            противоречия преимущественную силу имеют условия Соглашений с
            Организациями.
          </p>
        </li>
        <li>
          <p>
            <strong>Изменения.</strong> {application} вправе по своему
            усмотрению изменять настоящие Условия в любое время без
            предварительного уведомления. Дата последнего изменения Условий
            публикуется в начале этого документа. Вы обязаны периодически
            проверять наличие обновлений. Продолжая использовать Платформу, вы
            подтверждаете согласие с изменёнными Условиями.
          </p>
        </li>
        <li>
          <strong>Конфиденциальность.</strong> Настоящие Условия включают
          положения этого документа, а также нашей{" "}
          <Link href="/privacy" prefetch={false}>
            Политики конфиденциальности
          </Link>
          .
        </li>
        <li>
          <p>
            <strong>Допустимое использование.</strong> {application}
            предоставляет вам разрешение на доступ к Платформе и её
            использование при условии соблюдения настоящих Условий, а также
            следующих ограничений и обязательств:
          </p>
          <ul>
            <li>
              Вы можете использовать Платформу только от имени Организаций и
              только в пределах, разрешённых Соглашениями с Организациями.
            </li>
            <li>
              Вы не вправе передавать свой доступ другим лицам или позволять им
              пользоваться Платформой через вашу учётную запись.
            </li>
            <li>
              Платформу можно использовать только для законной деятельности. Вы
              несёте ответственность за соблюдение применимых местных,
              региональных и федеральных законов и нормативных актов.
            </li>
            <li>
              Запрещены декомпиляция, реверс-инжиниринг и попытки получить
              исходный код, идеи или связанную информацию о Платформе.
            </li>
            <li>
              Запрещено вводить, хранить или передавать вирусы, черви и иной
              вредоносный код через Платформу или с её помощью.
            </li>
            <li>
              Запрещено обходить, отключать или иным образом нарушать механизмы
              защиты программного обеспечения Платформы.
            </li>
            <li>
              Запрещено удалять или скрывать обозначения продукта, уведомления
              об авторских правах и иные указания на права собственности в
              элементах Платформы или связанной документации.
            </li>
          </ul>
        </li>
        <li>
          <p>
            <strong>Учётные записи пользователей.</strong> Вы можете создать
            учётную запись, войдя через сторонние платформы («Сторонние
            аутентификаторы», включая, среди прочего, Google). Сторонний
            аутентификатор определяет, какую информацию мы можем получать и
            использовать. Ваша учётная запись {application} создаётся на основе
            персональных данных, которые вы предоставляете или которые мы
            получаем через стороннего аутентификатора.
          </p>
          <p>
            Вы и Организации несёте ответственность за сохранность пароля и
            учётной записи, а также за все действия, совершённые под вашей
            учётной записью. Вы соглашаетесь (a) немедленно уведомлять{" "}
            {application} о любом несанкционированном использовании пароля или
            учётной записи либо о другом нарушении безопасности и (b) завершать
            сеанс при окончании работы с Платформой. {application} не несёт
            ответственности за убытки, возникшие из-за нарушения этого раздела.
          </p>
          <p>
            Чтобы удалить учётную запись, следуйте процедурам, описанным в нашей{" "}
            <Link href="/privacy" prefetch={false}>
              Политике конфиденциальности
            </Link>
            .
          </p>
          <p>
            Вы не можете передать учётную запись другому лицу без нашего
            предварительного письменного разрешения.
          </p>
        </li>
        <li>
          <p>
            <strong>Контент.</strong> Каждая Организация владеет всем контентом,
            который она отправляет через Платформу, включая контент, который
            отправляете вы или другие представители Организации (совместно —{" "}
            <strong>«Контент Организации»</strong>).
          </p>
          <p>
            Вы не можете использовать, копировать, адаптировать, изменять,
            создавать производные работы, распространять, лицензировать,
            продавать, передавать, публично демонстрировать, транслировать или
            иным образом эксплуатировать Контент {application}, за исключением
            случаев, когда это необходимо для доступа к Платформе и её
            использования от имени Организаций в соответствии с настоящими
            Условиями и Соглашениями с Организациями.
          </p>
        </li>
        <li>
          <p>
            <strong>Сторонние приложения.</strong> Вы или Организации можете
            использовать определённые сторонние продукты или услуги совместно с
            Платформой (далее — <strong>«Сторонние приложения»</strong>). Их
            использование регулируется отдельным соглашением между
            соответствующей Организацией и поставщиком либо между вами и
            поставщиком (далее — <strong>«Внешний поставщик»</strong>). Вы
            признаёте, что {application} не контролирует таких поставщиков и
            приложения и не несёт ответственности за их содержание, работу или
            использование. {application} не даёт никаких заявлений или гарантий
            относительно законности, точности, качества или подлинности контента
            и услуг сторонних приложений. НАСТОЯЩИМ {application} ОТКАЗЫВАЕТСЯ
            ОТ ВСЕЙ ОТВЕТСТВЕННОСТИ ЗА СТОРОННИЕ ПРИЛОЖЕНИЯ И ДЕЙСТВИЯ ИЛИ
            БЕЗДЕЙСТВИЕ ВНЕШНИХ ПОСТАВЩИКОВ, и вы безотзывно отказываетесь от
            любых претензий к {application} в связи с содержанием или работой
            сторонних приложений.
          </p>
        </li>
        <li>
          <strong>Отзывы.</strong> Мы приветствуем ваши отзывы, комментарии и
          предложения по улучшению Платформы (далее — <strong>«Отзывы»</strong>
          ). Вы соглашаетесь, что {application} вправе, но не обязан,
          использовать такие Отзывы без обязанности указывать авторство,
          выплачивать роялти или предоставлять вам права на изменения Платформы.
        </li>
        <li>
          <p>
            <strong>Прекращение.</strong> {application} может немедленно и без
            предварительного уведомления расторгнуть настоящие Условия и
            отключить ваш доступ к Платформе, если по своему усмотрению
            определит, что (a) вы нарушили настоящие Условия или (b) нарушили
            применимые законы, нормативные акты либо права третьих лиц. Кроме
            того, если все Соглашения с Организациями истекают или расторгаются
            по любой причине, {application} немедленно прекращает действие
            настоящих Условий и ваш доступ к Платформе. {application} может
            временно приостановить доступ в обстоятельствах, предусмотренных
            Соглашениями с Организациями.
          </p>
          <p>
            Положения, которые по своей природе должны сохранять силу после
            прекращения Условий, остаются в силе. В частности, сохраняются
            ограничения ответственности, условия об интеллектуальной
            собственности и положения о разрешении споров.
          </p>
        </li>
        <li>
          <p>
            <strong>Отказ от гарантий.</strong> ВЫ ПРИЗНАЁТЕ, ЧТО ИСПОЛЬЗУЕТЕ
            ПЛАТФОРМУ НА СВОЙ СТРАХ И РИСК. ПЛАТФОРМА И КОНТЕНТ {application}{" "}
            ПРЕДОСТАВЛЯЮТСЯ «КАК ЕСТЬ», И {application}, ЕГО АФФИЛИРОВАННЫЕ ЛИЦА
            И СТОРОННИЕ ПОСТАВЩИКИ УСЛУГ ОТКАЗЫВАЮТСЯ ОТ ЛЮБЫХ ГАРАНТИЙ, ЯВНЫХ
            ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ, ПОМИМО ПРОЧЕГО, ГАРАНТИИ ТОЧНОСТИ,
            НАДЁЖНОСТИ, КОММЕРЧЕСКОЙ ПРИГОДНОСТИ, НЕНАРУШЕНИЯ ПРАВ, ПРИГОДНОСТИ
            ДЛЯ КОНКРЕТНОЙ ЦЕЛИ И ЛЮБЫЕ ИНЫЕ ГАРАНТИИ ИЛИ ЗАЯВЛЕНИЯ.{" "}
            {application} НЕ ГАРАНТИРУЕТ БЕСПЕРЕБОЙНЫЙ ДОСТУП, ОТСУТСТВИЕ СБОЕВ,
            ОШИБОК, ПРОПУСКОВ ИЛИ ПОТЕРИ ПЕРЕДАВАЕМОЙ ИНФОРМАЦИИ, А ТАКЖЕ
            ОТСУТСТВИЕ ВИРУСОВ ПРИ ИСПОЛЬЗОВАНИИ ПЛАТФОРМЫ.
          </p>
          <p>
            В некоторых юрисдикциях отказ от подразумеваемых гарантий не
            допускается, поэтому у вас могут быть дополнительные права по
            местному законодательству.
          </p>
        </li>
        <li>
          <p>
            <strong>Ограничение ответственности.</strong> ВЫ ИСПОЛЬЗУЕТЕ
            ПЛАТФОРМУ ОТ ИМЕНИ ОДНОЙ ИЛИ НЕСКОЛЬКИХ ОРГАНИЗАЦИЙ. В МАКСИМАЛЬНОЙ
            СТЕПЕНИ, ДОПУЩЕННОЙ ПРИМЕНИМЫМ ПРАВОМ, НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ
            И НИ ПО КАКОЙ ПРАВОВОЙ ТЕОРИИ {application} (ИЛИ ЕГО ЛИЦЕНЗИАРЫ И
            ПОСТАВЩИКИ) НЕ НЕСЁТ ОТВЕТСТВЕННОСТИ ПЕРЕД ВАМИ ЗА ПРЯМЫЕ,
            КОСВЕННЫЕ, ОСОБЫЕ, СЛУЧАЙНЫЕ ИЛИ ПОСЛЕДУЮЩИЕ УБЫТКИ ЛЮБОГО РОДА,
            ВКЛЮЧАЯ УПУЩЕННУЮ ВЫГОДУ, ПОТЕРЮ ДЕЛОВОЙ РЕПУТАЦИИ, ПРОСТОЙ,
            НЕТОЧНОСТЬ РЕЗУЛЬТАТОВ ИЛИ СБОЙ КОМПЬЮТЕРА.
          </p>
        </li>
        <li>
          <strong>Уведомления.</strong> Любые уведомления по настоящим Условиям
          направляются в письменной форме {application} (a) по электронной почте
          (на адрес, который вы указали) или (b) путём публикации на сайте.
        </li>
        <li>
          <strong>Отказ от права.</strong> Неприменение {application}{" "}
          какого-либо права или положения настоящих Условий не означает отказа
          от дальнейшего применения этого права или положения.
        </li>
        <li>
          <strong>Уступка.</strong> Вы не можете уступать или передавать
          настоящие Условия без предварительного письменного согласия{" "}
          {application}. Любая попытка такой уступки без согласия ничтожна.{" "}
          {application} может уступать или передавать настоящие Условия по
          своему усмотрению без ограничений. С учётом изложенного Условия
          обязательны для сторон, их правопреемников и дозволенных цессионариев.
          Если иное прямо не указано, Условия не предоставляют прав третьим
          лицам.
        </li>
        <li>
          <strong>Делимость.</strong> Если какое-либо положение Условий будет
          признано недействительным или неисполнимым, оно применяется в
          максимально допустимой мере, а остальные положения сохраняют полную
          силу.
        </li>
        <li>
          <strong>Применимое право.</strong> Законы штата Калифорния (без учёта
          коллизионных норм) регулируют настоящие Условия и любые споры между
          вами и {application} в связи с ними. Вместе с тем, поскольку доступ к
          Платформе осуществляется от имени Организаций и регулируется
          Соглашениями с Организациями, споры, связанные с использованием
          Платформы, разрешаются в соответствии с процедурой, установленной в
          применимых Соглашениях с Организациями.
        </li>
        <li>
          <strong>Полнота соглашения.</strong> Настоящие Условия составляют
          полное соглашение между вами и {application} в отношении использования
          Платформы и заменяют все предшествующие соглашения, кроме Соглашений с
          Организациями.
        </li>
      </ol>
    </>
  )
}

function TermsEn({ application }: { application: string }) {
  return (
    <>
      <h1>Terms of use</h1>
      <EffectiveDate>Effective as of June 1, 2024</EffectiveDate>
      <ol>
        <li>
          <p>
            <strong>Agreement.</strong> These Terms of Service (the{" "}
            <strong>&quot;Terms&quot;</strong>) form a binding agreement between
            you and {application} Software (
            <strong>&quot;{application}&quot;</strong>,{" "}
            <strong>&quot;we&quot;</strong>, <strong>&quot;our&quot;</strong>,
            and <strong>&quot;us&quot;</strong>), the operator of the{" "}
            {application} platform (the <strong>&quot;Platform&quot;</strong>).
            These Terms set conditions for your access to and use of the
            Platform.
          </p>
          <p>
            By accessing or using the Platform in any way, you agree to be bound
            by these Terms.
          </p>
          <p>
            You access and use the Platform on behalf of one or more
            organizations you are affiliated with (each, an{" "}
            <strong>&quot;Organization&quot;</strong>). {application} and each
            Organization have entered into a separate agreement (the{" "}
            <strong>&quot;Organization Agreement&quot;</strong>) governing{" "}
            {application}&apos;s services to that Organization. These Terms do
            not alter Organization Agreements. If these Terms conflict with an
            Organization Agreement, the Organization Agreement controls.
          </p>
        </li>
        <li>
          <p>
            <strong>Modification.</strong> {application} may modify these Terms
            at any time without notice. The date of the latest modification will
            appear at the top of these Terms. It is your responsibility to check
            for updates. Continued use of the Platform means you accept the
            modified Terms.
          </p>
        </li>
        <li>
          <strong>Privacy.</strong> These Terms include the provisions of this
          document and our{" "}
          <Link href="/privacy" prefetch={false}>
            Privacy Policy
          </Link>
          .
        </li>
        <li>
          <p>
            <strong>Acceptable use.</strong> {application} grants you permission
            to access and use the Platform provided that use complies with these
            Terms and the following restrictions and obligations:
          </p>
          <ul>
            <li>
              You may use the Platform only on behalf of Organizations and only
              as permitted by Organization Agreements.
            </li>
            <li>
              You may not transfer your access to others or allow others to
              access the Platform through your account.
            </li>
            <li>
              You may use the Platform only for lawful activities and must
              comply with applicable laws and regulations.
            </li>
            <li>
              You may not decompile, reverse engineer, or attempt to obtain
              source code or underlying ideas related to the Platform.
            </li>
            <li>
              You may not introduce, store, or transmit viruses, worms, or other
              malicious code via the Platform.
            </li>
            <li>
              You may not bypass or disable software protection mechanisms on
              the Platform.
            </li>
            <li>
              You may not remove or obscure product, copyright, or other
              proprietary notices on the Platform or related documentation.
            </li>
          </ul>
        </li>
        <li>
          <p>
            <strong>User accounts.</strong> You may create an account by signing
            in with certain third-party platforms (&quot;Third-Party
            Authenticators&quot;, including Google). The authenticator
            determines what information we may access. Your {application}{" "}
            account is created from personal information you provide or that we
            obtain through the authenticator.
          </p>
          <p>
            You and the Organizations are responsible for keeping your password
            and account confidential and for all activity under your account.
            You agree to (a) promptly notify {application} of unauthorized use
            or other security breaches and (b) sign out at the end of each
            session. {application} is not liable for loss arising from failure
            to comply with this section.
          </p>
          <p>
            To cancel your account, follow the procedures in our{" "}
            <Link href="/privacy" prefetch={false}>
              Privacy Policy
            </Link>
            .
          </p>
          <p>
            You may not transfer your account without our prior written
            permission.
          </p>
        </li>
        <li>
          <p>
            <strong>Content.</strong> Each Organization owns all content it
            submits through the Platform, including content you or other
            Organization representatives submit (collectively,{" "}
            <strong>&quot;Organization Content&quot;</strong>).
          </p>
          <p>
            You may not use, copy, adapt, modify, create derivative works of,
            distribute, license, sell, transfer, publicly display, transmit, or
            otherwise exploit {application} Content except as needed to access
            and use the Platform on behalf of Organizations under these Terms
            and Organization Agreements.
          </p>
        </li>
        <li>
          <p>
            <strong>Third-party applications.</strong> You or Organizations may
            use certain third-party products or services with the Platform
            (&quot;Third-Party Applications&quot;). Use is subject to a separate
            agreement with the provider. You acknowledge that {application} does
            not control such providers or applications and is not responsible
            for their content, operation, or use. {application} DISCLAIMS ALL
            LIABILITY FOR THIRD-PARTY APPLICATIONS AND FOR ACTS OR OMISSIONS OF
            ANY THIRD-PARTY PROVIDER.
          </p>
        </li>
        <li>
          <strong>Feedback.</strong> We welcome feedback and suggestions to
          improve the Platform (&quot;Feedback&quot;). You agree that{" "}
          {application} may use Feedback without obligation to credit you, pay
          royalties, or grant ownership in Platform changes.
        </li>
        <li>
          <p>
            <strong>Termination.</strong> {application} may immediately
            terminate these Terms and disable your access if it determines you
            violated these Terms or applicable law or third-party rights. If all
            Organization Agreements expire or terminate, {application} will
            terminate these Terms and your Platform access. Access may also be
            suspended as provided in Organization Agreements.
          </p>
          <p>
            Provisions that by nature should survive termination will survive,
            including liability limits, IP terms, and dispute-related terms.
          </p>
        </li>
        <li>
          <p>
            <strong>Disclaimer of warranties.</strong> YOU USE THE PLATFORM AT
            YOUR OWN RISK. THE PLATFORM AND {application} CONTENT ARE PROVIDED
            &quot;AS IS&quot;, AND {application} DISCLAIMS ALL WARRANTIES,
            EXPRESS OR IMPLIED. {application} DOES NOT WARRANT UNINTERRUPTED
            ACCESS OR THAT THE PLATFORM WILL BE ERROR-FREE OR FREE OF VIRUSES.
          </p>
          <p>
            Some jurisdictions do not allow disclaimer of implied warranties, so
            you may have additional rights under local law.
          </p>
        </li>
        <li>
          <p>
            <strong>Limitation of liability.</strong> TO THE MAXIMUM EXTENT
            PERMITTED BY LAW, {application} WILL NOT BE LIABLE FOR ANY DIRECT,
            INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND,
            INCLUDING LOST PROFITS, GOODWILL, WORK STOPPAGE, OR COMPUTER
            FAILURE.
          </p>
        </li>
        <li>
          <strong>Notices.</strong> Notices may be provided by email to the
          address you provide or by posting on the website.
        </li>
        <li>
          <strong>No waiver.</strong> Failure by {application} to enforce any
          right or provision is not a waiver of future enforcement.
        </li>
        <li>
          <strong>Assignment.</strong> You may not assign these Terms without
          prior written consent of {application}. {application} may assign these
          Terms without restriction. These Terms bind permitted successors and
          assigns and do not confer rights on third parties unless expressly
          stated.
        </li>
        <li>
          <strong>Severability.</strong> If any provision is held invalid or
          unenforceable, it will be enforced to the maximum extent permitted and
          the remaining provisions will remain in effect.
        </li>
        <li>
          <strong>Governing law.</strong> The laws of the State of California
          govern these Terms and related disputes, without regard to conflict of
          laws principles. Disputes arising from Platform use on behalf of
          Organizations are handled under the dispute process in the applicable
          Organization Agreements.
        </li>
        <li>
          <strong>Entire agreement.</strong> These Terms are the entire
          agreement between you and {application} regarding Platform use and
          supersede prior agreements other than Organization Agreements.
        </li>
      </ol>
    </>
  )
}

function TermsEs({ application }: { application: string }) {
  return (
    <>
      <h1>Términos de uso</h1>
      <EffectiveDate>A partir del 1 de junio de 2024</EffectiveDate>
      <ol>
        <li>
          <p>
            <strong>Acuerdo.</strong> Los siguientes Términos de servicio (los{" "}
            <strong>&quot;Términos&quot;</strong> ) constituyen un acuerdo
            vinculante entre usted y {application} Software ({" "}
            <strong>&quot;{application}&quot;,</strong>{" "}
            <strong>&quot;nosotros&quot;,</strong>{" "}
            <strong>&quot;nuestro&quot;</strong> y{" "}
            <strong>&quot;nos&quot;</strong> ), el operador de la plataforma
            {application} (la <strong>&quot; Plataforma&quot;</strong> ). Estos
            Términos establecen condiciones con respecto a su acceso y uso de la
            Plataforma.
          </p>
          <p>
            Al acceder o utilizar la Plataforma de cualquier manera, usted
            acepta estar sujeto a estos Términos.
          </p>
          <p>
            Su acceso y uso de la Plataforma se realiza en nombre de una o más
            organizaciones a las que está afiliado (cada una, una{" "}
            <strong>&quot;Organización&quot;</strong> ). {application} y cada
            una de las Organizaciones han celebrado un acuerdo separado (el{" "}
            <strong>“Acuerdo de Organización”</strong> ) que rige la prestación
            de servicios de {application} a esa Organización. Estos Términos no
            alteran de ninguna manera los términos de los Acuerdos de
            Organización. En la medida en que estos Términos entren en conflicto
            con los Acuerdos de organización, prevalecerán los términos de los
            Acuerdos de organización.
          </p>
        </li>
        <li>
          <p>
            <strong>Modificación.</strong> {application} se reserva el derecho,
            a su exclusivo criterio, de modificar estos Términos en cualquier
            momento y sin previo aviso. La fecha de la última modificación de
            los Términos se publicará al comienzo de estos Términos. Es su
            responsabilidad comprobar periódicamente si hay actualizaciones. Al
            continuar accediendo o utilizando la Plataforma, usted indica que
            acepta estar sujeto a los Términos modificados.
          </p>
        </li>
        <li>
          <strong>Privacidad.</strong> Estos Términos incluyen las disposiciones
          de este documento, así como las de nuestra{" "}
          <Link href="/privacy" prefetch={false}>
            Política de Privacidad
          </Link>
          .
        </li>
        <li>
          <p>
            <strong>Uso Aceptable.</strong> Por el presente, {application} le
            otorga permiso para acceder y utilizar la Plataforma, siempre que
            dicho uso cumpla con estos Términos y, además, acepta
            específicamente que su uso cumplirá con las siguientes restricciones
            y obligaciones:
          </p>
          <ul>
            <li>
              Solo puede utilizar la Plataforma en nombre de las Organizaciones
              y solo según lo permitido en los Acuerdos de la Organización.
            </li>
            <li>
              No puede transferir su acceso a otros ni permitir que otros
              accedan a la Plataforma a través de su propio acceso.
            </li>
            <li>
              Sólo puede utilizar la Plataforma para actividades legales. Es su
              responsabilidad cumplir con todas las leyes y regulaciones
              locales, estatales y federales aplicables.
            </li>
            <li>
              No puede descompilar, realizar ingeniería inversa ni intentar
              obtener el código fuente o las ideas subyacentes o información de
              la Plataforma o relacionada con ella.
            </li>
            <li>
              No puede ingresar, almacenar ni transmitir virus, gusanos u otros
              códigos maliciosos dentro, a través de, hacia o utilizando la
              Plataforma.
            </li>
            <li>
              No puede anular, evitar, eludir, eliminar, desactivar ni eludir de
              otro modo ningún mecanismo de protección de software en la
              Plataforma.
            </li>
            <li>
              No puede eliminar ni ocultar ninguna identificación de producto,
              derechos de autor u otro aviso de propiedad de ningún elemento de
              la Plataforma o documentación asociada.
            </li>
          </ul>
        </li>
        <li>
          <p>
            <strong>Cuentas de usuario.</strong> Puede crear una cuenta
            iniciando sesión en su cuenta con ciertas plataformas de terceros
            (&quot;Autenticadores de terceros&quot;, incluido, entre otros,
            Google). El Autenticador de terceros determinará a qué información
            podremos acceder y utilizar. Su cuenta de {application} se creará
            para su uso de la Plataforma en función de la información personal
            que nos proporcione o que obtengamos a través del Autenticador de
            terceros.
          </p>
          <p>
            Usted y las Organizaciones son responsables de mantener la
            confidencialidad de su contraseña y cuenta, y son totalmente
            responsables de todas y cada una de las actividades que ocurran bajo
            su contraseña o cuenta. Usted acepta (a) notificar inmediatamente a
            {application} sobre cualquier uso no autorizado de su contraseña o
            cuenta o cualquier otra violación de seguridad, y (b) asegurarse de
            salir de su cuenta al final de cada sesión cuando acceda a la
            Plataforma.
            {application} no será responsable de ninguna pérdida o daño que
            surja del incumplimiento de esta sección.
          </p>
          <p>
            Si desea que cancelemos su cuenta, siga los procedimientos
            establecidos en nuestra{" "}
            <Link href="/privacy" prefetch={false}>
              Política de Privacidad.
            </Link>
          </p>
          <p>
            No puede transferir su cuenta a nadie más sin nuestro permiso previo
            por escrito.
          </p>
        </li>
        <li>
          <p>
            <strong>Contenido.</strong> Cada Organización es propietaria de todo
            el contenido que envía a través de la Plataforma, incluido cualquier
            contenido que usted u otros representantes de la Organización envíen
            a través de la Plataforma (colectivamente, el{" "}
            <strong>&quot;Contenido de la Organización&quot;</strong> ).{" "}
          </p>
          <p>
            No puede usar, copiar, adaptar, modificar, preparar trabajos
            derivados basados ​​en, distribuir, licenciar, vender, transferir,
            exhibir públicamente, transmitir, difundir o explotar de otro modo
            el Contenido del {application}, excepto cuando sea necesario para
            acceder y utilizar la Plataforma en nombre de las Organizaciones de
            conformidad con estos Términos y los Acuerdos de Organización.
          </p>
        </li>
        <li>
          <p>
            <strong>Aplicaciones de terceros.</strong> Usted o las
            Organizaciones pueden optar por utilizar ciertos productos o
            servicios de terceros en relación con la Plataforma (las{" "}
            <strong>“Aplicaciones de Terceros”</strong> ). Su uso de cualquier
            Aplicación de terceros está sujeto a un acuerdo separado entre la
            Organización correspondiente y el proveedor de esa Aplicación de
            terceros (el <strong>&quot;Proveedor externo&quot;</strong> ) o
            usted y el Proveedor externo. Por la presente, reconoce que{" "}
            {application} no controla dichos Proveedores externos o Aplicaciones
            de terceros, y no se hace responsable de su contenido, operación o
            uso. {application} no realiza ninguna representación, garantía o
            respaldo, expreso o implícito, con respecto a la legalidad,
            exactitud, calidad o autenticidad del contenido, la información o
            los servicios proporcionados por las aplicaciones de terceros. POR
            EL PRESENTE,
            {application} RENUNCIA A TODA RESPONSABILIDAD POR CUALQUIER
            APLICACIÓN DE TERCEROS Y POR LOS ACTOS U OMISIONES DE CUALQUIER
            PROVEEDOR DE TERCEROS, y por la presente usted renuncia
            irrevocablemente a cualquier reclamo contra {application} con
            respecto al contenido o el funcionamiento de cualquier Aplicación de
            terceros.
          </p>
        </li>
        <li>
          <strong>Comentario.</strong> Le damos la bienvenida y le animamos a
          que proporcione su opinión, comentarios y sugerencias para mejorar la
          Plataforma ( <strong>&quot;Comentarios&quot;</strong> ). Usted acepta
          que {application} tiene el derecho, pero no la obligación, de utilizar
          dichos Comentarios sin ninguna obligación de proporcionarle crédito,
          pago de regalías o interés de propiedad en los cambios en la
          Plataforma.
        </li>
        <li>
          <p>
            <strong>Terminación.</strong> {application} puede rescindir
            inmediatamente y sin previo aviso estos Términos e inhabilitar su
            acceso a la Plataforma si {application} determina, a su entera
            discreción, que (a) usted ha violado estos Términos, o (b) ha
            violado las leyes, regulaciones o derechos de terceros aplicables. .
            Además, si todos los Acuerdos de organización vencen o se rescinden
            por cualquier motivo, {application}
            rescindirá inmediatamente estos Términos y su acceso a la
            Plataforma. {application} podrá suspender temporalmente su acceso a
            la Plataforma en determinadas circunstancias establecidas en los
            Acuerdos de Organización.
          </p>
          <p>
            Las disposiciones que, por su naturaleza, deberían sobrevivir a la
            terminación de estos Términos seguirán vigentes. A modo de ejemplo,
            todo lo siguiente sobrevivirá a la terminación: cualquier limitación
            de nuestra responsabilidad, cualquier término relacionado con la
            propiedad o los derechos de propiedad intelectual y los términos
            relacionados con las disputas entre nosotros.
          </p>
        </li>
        <li>
          <p>
            <strong>Renuncia de Garantías.</strong> POR LA PRESENTE USTED
            RECONOCE QUE ESTÁ UTILIZANDO LA PLATAFORMA BAJO SU PROPIO RIESGO. LA
            PLATAFORMA Y EL CONTENIDO DE {application} SE PROPORCIONAN &quot;TAL
            CUAL&quot;, Y {application}, SUS AFILIADOS Y SUS PROVEEDORES DE
            SERVICIOS TERCEROS POR EL PRESENTE RECHAZAN CUALQUIER GARANTÍA,
            EXPRESA E IMPLÍCITA, INCLUYENDO, PERO NO LIMITADO A, CUALQUIER
            GARANTÍA DE EXACTITUD, CONFIABILIDAD, COMERCIABILIDAD, NO
            INFRACCIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y CUALQUIER OTRA
            GARANTÍA, CONDICIÓN O DECLARACIÓN, YA SEA ORAL, POR ESCRITO O EN
            FORMA ELECTRÓNICA. {application}, SUS AFILIADOS Y SUS TERCEROS
            PROVEEDORES DE SERVICIOS NO DECLARA NI GARANTIZAN QUE EL ACCESO A LA
            PLATAFORMA SERÁ ININTERRUMPIDO O QUE NO HABRÁ FALLAS, ERRORES U
            OMISIONES O PÉRDIDA DE INFORMACIÓN TRANSMITIDA, O QUE NO SE
            TRANSMITIRÁN VIRUS A TRAVÉS DEL PLATAFORMA.
          </p>
          <p>
            Debido a que algunos estados no permiten la renuncia de garantías
            implícitas, es posible que tenga derechos adicionales según las
            leyes locales.
          </p>
        </li>
        <li>
          <p>
            <strong>Limitación de responsabilidad.</strong> SU ACCESO Y USO DE
            LA PLATAFORMA ES EN NOMBRE DE UNA O MÁS ORGANIZACIONES. EN
            CONSECUENCIA, EN LA MEDIDA MÁXIMA PERMITIDA POR LA LEY APLICABLE,
            BAJO NINGUNA CIRCUNSTANCIA Y BAJO NINGUNA TEORÍA LEGAL (INCLUYENDO,
            SIN LIMITACIÓN, AGRAVIO, CONTRATO, RESPONSABILIDAD ESTRICTA O DE
            OTRA MANERA), {application} (O SUS LICENCIANTES O PROVEEDORES) SERÁ
            RESPONSABLE ANTE USTED POR CUALQUIER DAÑOS DIRECTOS, INDIRECTOS,
            ESPECIALES, INCIDENTALES O CONSECUENCIALES DE CUALQUIER TIPO,
            INCLUYENDO DAÑOS POR PÉRDIDA DE BENEFICIOS, PÉRDIDA DE BUENA
            VOLUNTAD, PARO LABORAL, EXACTITUD DE LOS RESULTADOS O FALLA O MAL
            FUNCIONAMIENTO DE LA COMPUTADORA.
          </p>
        </li>
        <li>
          <strong>Avisos.</strong> Cualquier aviso u otra comunicación permitida
          o requerida en virtud del presente se realizará por escrito y será
          entregada por {application} (a) por correo electrónico (en cada caso a
          la dirección que usted proporcione) o (b) mediante publicación en el
          sitio web.
        </li>
        <li>
          <strong>No renuncio.</strong> El hecho de que {application} no haga
          cumplir cualquier derecho o disposición de estos Términos no
          constituirá una renuncia a la aplicación futura de ese derecho o
          disposición.
        </li>
        <li>
          <strong>Asignación.</strong> No puede ceder ni transferir estos
          Términos, por aplicación de la ley o de otro modo, sin el
          consentimiento previo por escrito de {application}. Cualquier intento
          por su parte de ceder o transferir estos Términos sin dicho
          consentimiento será nulo y sin efecto. {application} puede ceder o
          transferir estos Términos, a su exclusivo criterio, sin restricciones.
          Sujeto a lo anterior, estos Términos vincularán y redundarán en
          beneficio de las partes, sus sucesores y cesionarios permitidos. A
          menos que una persona o entidad se identifique explícitamente como un
          tercero beneficiario de estos Términos, estos Términos no confieren ni
          tienen la intención de conferir ningún derecho o recurso a ninguna
          persona o entidad que no sean las partes.
        </li>
        <li>
          <strong>Divisibilidad.</strong> Si por algún motivo un árbitro o un
          tribunal de jurisdicción competente determina que alguna disposición
          de estos Términos es inválida o inaplicable, esa disposición se
          aplicará en la medida máxima permitida y las demás disposiciones de
          estos Términos permanecerán en pleno vigor y efecto.
        </li>
        <li>
          <strong>Ley que rige.</strong> Las leyes del Estado de California, sin
          referencia a su elección o ley o reglas o principios de conflicto de
          leyes, regirán estos Términos y cualquier disputa de cualquier tipo
          que pueda surgir entre usted y {application} con respecto a estos
          Términos. Sin perjuicio de lo anterior, usted reconoce que, dado que
          su acceso y uso de la Plataforma se realiza en nombre de una o más
          Organizaciones y está sujeto a los Acuerdos de la Organización,
          cualquier disputa que surja de su uso de la Plataforma se manejará de
          acuerdo con el proceso de resolución de disputas. establecidos en los
          Acuerdos de Organización aplicables.
        </li>
        <li>
          <strong>Acuerdo completo.</strong> Estos Términos constituyen el
          acuerdo completo entre usted y {application} con respecto a su uso de
          la Plataforma, y reemplazan todos los acuerdos anteriores, escritos u
          orales, distintos de los Acuerdos de organización.
        </li>
      </ol>
    </>
  )
}
