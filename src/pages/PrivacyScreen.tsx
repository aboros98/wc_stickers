import { LegalLayout } from '../components/LegalLayout'
import { APP_NAME, CONTACT_EMAIL } from '../lib/legal'

export function PrivacyScreen() {
  return (
    <LegalLayout title="Confidențialitate">
      <p>
        {APP_NAME} este o aplicație personală, gratuită, care te ajută să-ți ții
        evidența colecției de abțibilduri și să faci schimburi cu prietenii.
        Această politică explică ce date folosim și de ce.
      </p>

      <section>
        <h2>Ce date colectăm</h2>
        <ul>
          <li>
            <strong>Cont Google:</strong> numele, adresa de email și poza de
            profil, primite atunci când te autentifici cu Google.
          </li>
          <li>
            <strong>Colecția ta:</strong> ce abțibilduri ai, care îți lipsesc și
            care sunt dubluri.
          </li>
        </ul>
      </section>

      <section>
        <h2>De ce le folosim</h2>
        <p>
          Doar ca să facem aplicația să funcționeze: să-ți afișăm albumul și
          progresul și să calculăm automat schimburile cu prietenii.
        </p>
      </section>

      <section>
        <h2>Ce văd prietenii tăi</h2>
        <p>
          Când tu și un prieten vă adăugați reciproc, el poate vedea numele tău,
          poza de profil și ce abțibilduri îți lipsesc sau ai în plus — strict ce
          este necesar pentru schimburi. <strong>Adresa ta de email nu este
          arătată altor utilizatori.</strong>
        </p>
      </section>

      <section>
        <h2>Unde sunt stocate</h2>
        <p>
          Datele sunt păstrate în siguranță la Supabase (furnizorul nostru de
          bază de date), iar autentificarea este gestionată de Google. Reguli de
          securitate fac astfel încât fiecare să-și vadă doar propriile date și
          pe ale prietenilor adăugați.
        </p>
      </section>

      <section>
        <h2>Ce nu facem</h2>
        <p>
          Nu vindem datele tale, nu afișăm reclame, nu folosim urmărire
          publicitară și nu partajăm datele cu terți în scop comercial.
        </p>
      </section>

      <section>
        <h2>Drepturile tale</h2>
        <p>
          Poți cere oricând ștergerea contului și a tuturor datelor asociate,
          scriindu-ne la{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>Modificări</h2>
        <p>
          Putem actualiza această politică din când în când; data de mai sus
          reflectă ultima versiune.
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
