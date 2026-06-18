import { LegalLayout } from '../components/LegalLayout'
import { APP_NAME, CONTACT_EMAIL } from '../lib/legal'

export function TermsScreen() {
  return (
    <LegalLayout title="Termeni și condiții">
      <p>
        Bine ai venit pe {APP_NAME}. Folosind aplicația, ești de acord cu acești
        termeni.
      </p>

      <section>
        <h2>Despre aplicație</h2>
        <p>
          Este o aplicație gratuită, personală și fără scop comercial, făcută
          pentru pasionații care își completează albumul de abțibilduri.
        </p>
      </section>

      <section>
        <h2>Fără afiliere oficială</h2>
        <p>
          Aplicația <strong>nu este afiliată, sponsorizată sau aprobată</strong>{' '}
          de Panini, FIFA sau organizatorii Cupei Mondiale. Toate mărcile,
          numele și drepturile aparțin proprietarilor lor. Numerele și structura
          albumului sunt folosite exclusiv ca să-ți organizezi propria colecție.
        </p>
      </section>

      <section>
        <h2>Contul tău</h2>
        <p>
          Te autentifici cu Google. Ești responsabil de activitatea din contul
          tău.
        </p>
      </section>

      <section>
        <h2>Utilizare acceptabilă</h2>
        <p>
          Folosește aplicația corect: nu încerca să o spargi, să o
          suprasoliciți sau să accesezi datele altor utilizatori.
        </p>
      </section>

      <section>
        <h2>Schimburile</h2>
        <p>
          Schimburile de abțibilduri se fac între voi, direct. Aplicația doar vă
          ajută să vedeți ce vă trebuie — nu suntem parte în schimburi și nu
          garantăm că acestea au loc.
        </p>
      </section>

      <section>
        <h2>Fără garanții</h2>
        <p>
          Aplicația este oferită „ca atare”, fără garanții. Pot apărea erori sau
          întreruperi și nu răspundem pentru eventuale pierderi de date.
        </p>
      </section>

      <section>
        <h2>Încetare</h2>
        <p>
          Putem suspenda sau șterge conturi care încalcă acești termeni.
        </p>
      </section>

      <section>
        <h2>Modificări</h2>
        <p>
          Putem actualiza acești termeni; data de mai sus reflectă ultima
          versiune.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Întrebări? Scrie-ne la{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
