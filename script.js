const form = document.querySelector(".rsvp-form");

if (form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const note = form.querySelector(".form-note");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const honeypot = String(formData.get("_gotcha") || "").trim();

    if (honeypot) {
      return;
    }

    const formspreeUrl = form.action;
    const sheetWebhook = form.dataset.sheetWebhook || "";

    if (submitBtn) submitBtn.disabled = true;
    if (note) {
      note.textContent = "Envoi en cours...";
    }

    try {
      const formspreeRequest = fetch(formspreeUrl, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      const requests = [formspreeRequest];

      if (sheetWebhook) {
        const payload = {
          nom: String(formData.get("Nom") || ""),
          email: String(formData.get("Email") || ""),
          telephone: String(formData.get("Téléphone") || ""),
          nombre_personnes: String(formData.get("Nombre de personnes") || ""),
          source: "site-mariage",
          timestamp: new Date().toISOString()
        };

        requests.push(
          fetch(sheetWebhook, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          })
        );
      }

      const [formspreeResponse] = await Promise.all(requests);

      if (!formspreeResponse.ok) {
        throw new Error("Erreur Formspree");
      }

      form.reset();
      const successMessage = sheetWebhook
        ? "Merci, ta confirmation a bien été envoyée et enregistrée. Nous sommes impatients de vous retrouver tous."
        : "Merci, votre confirmation a bien ete envoyee.";

      if (note) {
        note.textContent = successMessage;
      }

      alert(successMessage);
    } catch (error) {
      if (note) {
        note.textContent = "Une erreur est survenue. Merci de reessayer ou de nous contacter par email.";
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

