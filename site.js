const locales = ['ko', 'en', 'ja', 'es', 'de', 'fr', 'zh'];

const copy = {
  ko: {
    language: '언어', brand: 'ALPHA: REFORGE', homeTitle: '반복으로 자신을 다시 세워라.',
    homeLead: 'ALPHA는 BASIC부터 HARD까지 이어지는 30일 루틴과 기록의 과정입니다.',
    support: '지원', privacy: '개인정보 처리방침', terms: '이용약관', updated: '2026년 7월 17일 시행',
    supportTitle: 'ALPHA 지원', supportLead: '앱 사용 중 문제가 생겼다면 아래 내용을 확인하거나 문의해 주세요.',
    faq1: '기록은 어디에 저장되나요?', faq1a: '루틴, 진행률, 하루 마감, 회고와 선택한 카드 이미지는 사용자의 기기에 저장됩니다.',
    faq2: '앱을 삭제하면 기록이 남나요?', faq2a: '앱을 삭제하면 기기에 저장된 앱 데이터도 삭제될 수 있습니다. ALPHA는 별도 계정이나 클라우드 백업을 제공하지 않습니다.',
    faq3: '카드 이미지는 서버로 전송되나요?', faq3a: '아니요. 사용자가 선택하고 편집한 이미지는 기기 안에서만 처리됩니다.',
    faq4: '알림이 오지 않아요.', faq4a: '기기 설정에서 ALPHA의 알림 권한이 켜져 있는지 확인해 주세요. 알림은 기기에서 로컬로 예약됩니다.',
    contact: '문의', contactLead: '문의할 때 기기 모델, OS 버전, 앱 버전과 문제 상황을 함께 보내 주세요.',
    privacyTitle: '개인정보 처리방침', privacyLead: 'ALPHA는 개인정보를 수집하거나 외부 서버로 전송하지 않습니다.',
    p1: '수집하는 데이터', p1a: 'ALPHA는 이름, 이메일, 위치, 연락처, 광고 식별자, 사용 분석 정보 또는 결제 정보를 수집하지 않습니다.',
    p2: '기기 내 데이터', p2a: '루틴, 기록, 회고, 설정과 사용자가 선택한 카드 이미지는 앱 기능 제공을 위해 기기에 저장됩니다. 개발자는 이 데이터에 접근할 수 없습니다.',
    p3: '사진 접근', p3a: '카드 이미지를 바꿀 때에만 사용자가 직접 선택한 사진에 접근합니다. 사진은 기기 안에서 편집되며 외부로 전송되지 않습니다.',
    p4: '알림', p4a: '사용자가 허용하면 하루 마감 알림을 기기에서 로컬로 예약합니다. 원격 푸시 서버나 사용자 추적에는 사용하지 않습니다.',
    p5: '결제', p5a: '앱 구매와 결제는 Apple App Store 또는 Google Play가 처리합니다. ALPHA 개발자는 결제 정보를 수집하지 않습니다.',
    p6: '백업과 삭제', p6a: '운영체제의 기기 백업 정책에 따라 앱 데이터가 백업될 수 있습니다. 앱 삭제 또는 앱 내 데이터 초기화로 로컬 데이터를 삭제할 수 있습니다.',
    p7: '아동 개인정보', p7a: 'ALPHA는 누구의 개인정보도 의도적으로 수집하지 않습니다.',
    p8: '변경 및 문의', p8a: '방침이 변경되면 이 페이지의 시행일을 갱신합니다. 문의는 아래 이메일로 보내 주세요.',
    termsTitle: '이용약관', termsLead: 'ALPHA를 내려받거나 사용하면 아래 조건에 동의한 것으로 봅니다.',
    t1: '서비스', t1a: 'ALPHA는 자기관리와 기록을 돕는 도구이며 의료, 심리, 운동 처방을 제공하지 않습니다.',
    t2: '사용자 책임', t2a: '사용자는 자신의 건강 상태와 한계를 고려해 루틴을 선택하고 수행해야 합니다.',
    t3: '데이터', t3a: '데이터는 기기에 저장됩니다. 삭제, 기기 손상 또는 운영체제 문제로 인한 데이터 손실을 막기 위해 사용자가 기기를 관리해야 합니다.',
    t4: '지식재산권', t4a: '앱의 코드, 디자인, 문구와 기본 시각 자산에 대한 권리는 East Noise에 있습니다. 개인이 선택한 사진의 권리는 해당 사용자에게 있습니다.',
    t5: '변경', t5a: '법률 또는 서비스 변경에 따라 약관을 갱신할 수 있습니다.',
  },
  en: {
    language: 'Language', brand: 'ALPHA: REFORGE', homeTitle: 'Rebuild yourself through repetition.',
    homeLead: 'ALPHA is a 30-day discipline and reflection program that progresses from BASIC to HARD.',
    support: 'Support', privacy: 'Privacy Policy', terms: 'Terms of Use', updated: 'Effective July 17, 2026',
    supportTitle: 'ALPHA Support', supportLead: 'If something is not working, check the answers below or contact us.',
    faq1: 'Where is my progress stored?', faq1a: 'Routines, progress, day closures, reflections, and selected card images are stored on your device.',
    faq2: 'Will my data remain after deleting the app?', faq2a: 'Deleting the app may also delete its local data. ALPHA does not provide an account or cloud backup.',
    faq3: 'Are card images uploaded?', faq3a: 'No. Images you select and crop are processed and stored only on your device.',
    faq4: 'Why am I not receiving reminders?', faq4a: 'Confirm that notifications are allowed for ALPHA in device settings. Reminders are scheduled locally on the device.',
    contact: 'Contact', contactLead: 'Include your device model, OS version, app version, and a description of the issue.',
    privacyTitle: 'Privacy Policy', privacyLead: 'ALPHA does not collect personal data or transmit it to an external server.',
    p1: 'Data we collect', p1a: 'ALPHA does not collect names, email addresses, locations, contacts, advertising identifiers, analytics, or payment information.',
    p2: 'On-device data', p2a: 'Routines, records, reflections, settings, and selected card images are stored on your device to provide app features. The developer cannot access this data.',
    p3: 'Photo access', p3a: 'ALPHA accesses only the photo you choose when changing a card image. It is edited on the device and is never uploaded.',
    p4: 'Notifications', p4a: 'With your permission, ALPHA schedules a local day-closing reminder. It does not use a remote push server or tracking.',
    p5: 'Payments', p5a: 'Apple App Store or Google Play processes purchases. The ALPHA developer does not collect payment information.',
    p6: 'Backups and deletion', p6a: 'App data may be included in device backups under your operating system settings. Delete the app or use its reset feature to remove local data.',
    p7: "Children's privacy", p7a: 'ALPHA does not intentionally collect personal data from anyone.',
    p8: 'Changes and contact', p8a: 'If this policy changes, the effective date on this page will be updated. Contact us at the email below.',
    termsTitle: 'Terms of Use', termsLead: 'By downloading or using ALPHA, you agree to these terms.',
    t1: 'Service', t1a: 'ALPHA is a self-management and journaling tool. It does not provide medical, psychological, or exercise prescriptions.',
    t2: 'Your responsibility', t2a: 'Choose and perform routines with regard to your health, condition, and limits.',
    t3: 'Data', t3a: 'Data is stored on your device. You are responsible for device management and backups against deletion, damage, or operating-system failures.',
    t4: 'Intellectual property', t4a: 'East Noise owns the app code, design, copy, and default visual assets. Users retain rights to photos they select.',
    t5: 'Changes', t5a: 'These terms may be updated to reflect legal or service changes.',
  },
};

const localizedChrome = {
  ja: {
    language: '言語', support: 'サポート', privacy: 'プライバシーポリシー', terms: '利用規約', updated: '2026年7月17日施行',
    homeTitle: '反復で、自分を鍛え直せ。', homeLead: 'ALPHAはBASICからHARDへ進む30日間の規律と記録のプログラムです。',
    supportTitle: 'ALPHA サポート', supportLead: '問題が発生した場合は、以下を確認するかお問い合わせください。',
    faq1: '進捗はどこに保存されますか？', faq1a: 'ルーティン、進捗、一日の締め、振り返り、選択したカード画像は端末に保存されます。',
    faq2: 'アプリを削除してもデータは残りますか？', faq2a: 'アプリを削除すると、端末内のデータも削除される場合があります。ALPHAにはアカウントやクラウドバックアップ機能はありません。',
    faq3: 'カード画像はアップロードされますか？', faq3a: 'いいえ。選択・編集した画像は端末内だけで処理、保存されます。',
    faq4: '通知が届きません。', faq4a: '端末の設定でALPHAの通知が許可されているか確認してください。リマインダーは端末内で予約されます。',
    contact: 'お問い合わせ', contactLead: '端末の機種、OS、アプリのバージョン、問題の状況をお知らせください。',
    privacyTitle: 'プライバシーポリシー', privacyLead: 'ALPHAは個人データを収集せず、外部サーバーにも送信しません。',
    p1: '収集するデータ', p1a: '氏名、メールアドレス、位置情報、連絡先、広告識別子、利用分析、決済情報を収集しません。',
    p2: '端末内のデータ', p2a: 'ルーティン、記録、振り返り、設定、カード画像は機能提供のため端末内に保存されます。開発者はこれらにアクセスできません。',
    p3: '写真へのアクセス', p3a: 'カード画像を変更するとき、ユーザーが選んだ写真だけにアクセスします。画像は端末内で編集され、外部に送信されません。',
    p4: '通知', p4a: '許可された場合、一日の締めのリマインダーを端末内で予約します。リモートプッシュや追跡には使用しません。',
    p5: '決済', p5a: '購入はApple App StoreまたはGoogle Playが処理します。ALPHAの開発者は決済情報を収集しません。',
    p6: 'バックアップと削除', p6a: 'OSの設定によりアプリデータが端末バックアップに含まれる場合があります。アプリの削除またはデータ初期化でローカルデータを削除できます。',
    p7: '子どものプライバシー', p7a: 'ALPHAは誰からも個人データを意図的に収集しません。',
    p8: '変更とお問い合わせ', p8a: '本ポリシーを変更する場合、このページの施行日を更新します。お問い合わせは以下のメールへお送りください。',
    termsTitle: '利用規約', termsLead: 'ALPHAをダウンロードまたは使用することで、以下の条件に同意したものとみなされます。',
    t1: 'サービス', t1a: 'ALPHAは自己管理と記録を支援するツールであり、医療、心理、運動の処方は行いません。',
    t2: 'ユーザーの責任', t2a: '自身の健康状態と限界を考慮し、ルーティンを選択・実行してください。',
    t3: 'データ', t3a: 'データは端末に保存されます。削除、端末の故障、OSの問題に備えた端末管理はユーザーの責任です。',
    t4: '知的財産権', t4a: 'アプリのコード、デザイン、文章、標準ビジュアルの権利はEast Noiseに帰属します。ユーザーが選択した写真の権利はユーザーに帰属します。',
    t5: '変更', t5a: '法令またはサービスの変更に応じて本規約を更新する場合があります。',
  },
  es: {
    language: 'Idioma', support: 'Soporte', privacy: 'Política de privacidad', terms: 'Condiciones de uso', updated: 'Vigente desde el 17 de julio de 2026',
    homeTitle: 'Reconstrúyete mediante la repetición.', homeLead: 'ALPHA es un programa de 30 días de disciplina y reflexión, de BASIC a HARD.',
    supportTitle: 'Soporte de ALPHA', supportLead: 'Si algo no funciona, consulta las respuestas o ponte en contacto con nosotros.',
    faq1: '¿Dónde se guarda mi progreso?', faq1a: 'Las rutinas, el progreso, los cierres diarios, las reflexiones y las imágenes elegidas se guardan en tu dispositivo.',
    faq2: '¿Se conservan los datos al borrar la app?', faq2a: 'Al borrar la app también pueden eliminarse sus datos locales. ALPHA no ofrece cuenta ni copia de seguridad en la nube.',
    faq3: '¿Se suben las imágenes de las tarjetas?', faq3a: 'No. Las imágenes que eliges y recortas se procesan y guardan únicamente en tu dispositivo.',
    faq4: 'No recibo recordatorios.', faq4a: 'Comprueba que las notificaciones de ALPHA estén permitidas. Los recordatorios se programan localmente.',
    contact: 'Contacto', contactLead: 'Incluye el modelo del dispositivo, la versión del sistema y de la app, y una descripción del problema.',
    privacyTitle: 'Política de privacidad', privacyLead: 'ALPHA no recopila datos personales ni los transmite a servidores externos.',
    p1: 'Datos que recopilamos', p1a: 'ALPHA no recopila nombres, correos, ubicación, contactos, identificadores publicitarios, analíticas ni datos de pago.',
    p2: 'Datos en el dispositivo', p2a: 'Rutinas, registros, reflexiones, ajustes e imágenes se guardan en tu dispositivo para ofrecer las funciones. El desarrollador no puede acceder a ellos.',
    p3: 'Acceso a fotos', p3a: 'ALPHA accede solo a la foto que eliges al cambiar una tarjeta. Se edita en el dispositivo y nunca se sube.',
    p4: 'Notificaciones', p4a: 'Con tu permiso, ALPHA programa localmente un recordatorio para cerrar el día. No usa servidores push remotos ni seguimiento.',
    p5: 'Pagos', p5a: 'Apple App Store o Google Play procesan las compras. El desarrollador de ALPHA no recopila datos de pago.',
    p6: 'Copias y eliminación', p6a: 'Los datos pueden incluirse en copias del dispositivo según el sistema operativo. Borra la app o usa el reinicio para eliminar los datos locales.',
    p7: 'Privacidad infantil', p7a: 'ALPHA no recopila intencionadamente datos personales de ninguna persona.',
    p8: 'Cambios y contacto', p8a: 'Si cambia esta política, actualizaremos la fecha de vigencia. Contacta mediante el correo indicado.',
    termsTitle: 'Condiciones de uso', termsLead: 'Al descargar o usar ALPHA aceptas estas condiciones.',
    t1: 'Servicio', t1a: 'ALPHA es una herramienta de autogestión y registro. No ofrece prescripciones médicas, psicológicas ni de ejercicio.',
    t2: 'Tu responsabilidad', t2a: 'Elige y realiza las rutinas teniendo en cuenta tu salud, estado y límites.',
    t3: 'Datos', t3a: 'Los datos se guardan en tu dispositivo. Eres responsable de gestionar el dispositivo y sus copias ante borrados, daños o fallos del sistema.',
    t4: 'Propiedad intelectual', t4a: 'East Noise posee el código, diseño, textos y recursos visuales predeterminados. Cada usuario conserva los derechos sobre las fotos que elige.',
    t5: 'Cambios', t5a: 'Podemos actualizar estas condiciones para reflejar cambios legales o del servicio.',
  },
  de: {
    language: 'Sprache', support: 'Support', privacy: 'Datenschutz', terms: 'Nutzungsbedingungen', updated: 'Gültig ab 17. Juli 2026',
    homeTitle: 'Baue dich durch Wiederholung neu auf.', homeLead: 'ALPHA ist ein 30-Tage-Programm für Disziplin und Reflexion, von BASIC bis HARD.',
    supportTitle: 'ALPHA Support', supportLead: 'Wenn etwas nicht funktioniert, prüfe die Antworten oder kontaktiere uns.',
    faq1: 'Wo wird mein Fortschritt gespeichert?', faq1a: 'Routinen, Fortschritt, Tagesabschlüsse, Reflexionen und gewählte Kartenbilder werden auf deinem Gerät gespeichert.',
    faq2: 'Bleiben Daten nach dem Löschen der App erhalten?', faq2a: 'Beim Löschen der App können auch lokale Daten gelöscht werden. ALPHA bietet kein Konto und kein Cloud-Backup.',
    faq3: 'Werden Kartenbilder hochgeladen?', faq3a: 'Nein. Ausgewählte und zugeschnittene Bilder werden nur auf deinem Gerät verarbeitet und gespeichert.',
    faq4: 'Ich erhalte keine Erinnerungen.', faq4a: 'Prüfe, ob Benachrichtigungen für ALPHA erlaubt sind. Erinnerungen werden lokal auf dem Gerät geplant.',
    contact: 'Kontakt', contactLead: 'Nenne Gerätemodell, Betriebssystem, App-Version und beschreibe das Problem.',
    privacyTitle: 'Datenschutzerklärung', privacyLead: 'ALPHA erhebt keine personenbezogenen Daten und überträgt sie nicht an externe Server.',
    p1: 'Erhobene Daten', p1a: 'ALPHA erhebt keine Namen, E-Mail-Adressen, Standorte, Kontakte, Werbe-IDs, Analysedaten oder Zahlungsinformationen.',
    p2: 'Daten auf dem Gerät', p2a: 'Routinen, Aufzeichnungen, Reflexionen, Einstellungen und Kartenbilder werden für die App-Funktionen auf deinem Gerät gespeichert. Der Entwickler hat keinen Zugriff.',
    p3: 'Fotozugriff', p3a: 'ALPHA greift nur auf das Foto zu, das du beim Ändern eines Kartenbilds auswählst. Es wird auf dem Gerät bearbeitet und nie hochgeladen.',
    p4: 'Benachrichtigungen', p4a: 'Mit deiner Erlaubnis plant ALPHA lokal eine Erinnerung zum Tagesabschluss. Es gibt keinen Remote-Push-Server und kein Tracking.',
    p5: 'Zahlungen', p5a: 'Käufe werden vom Apple App Store oder Google Play verarbeitet. Der ALPHA-Entwickler erhebt keine Zahlungsdaten.',
    p6: 'Backups und Löschung', p6a: 'Je nach Systemeinstellung können App-Daten in Geräte-Backups enthalten sein. Lösche die App oder nutze das Zurücksetzen, um lokale Daten zu entfernen.',
    p7: 'Datenschutz für Kinder', p7a: 'ALPHA erhebt von niemandem absichtlich personenbezogene Daten.',
    p8: 'Änderungen und Kontakt', p8a: 'Bei Änderungen aktualisieren wir das Gültigkeitsdatum. Nutze für Fragen die folgende E-Mail-Adresse.',
    termsTitle: 'Nutzungsbedingungen', termsLead: 'Durch Download oder Nutzung von ALPHA stimmst du diesen Bedingungen zu.',
    t1: 'Dienst', t1a: 'ALPHA ist ein Werkzeug für Selbstmanagement und Aufzeichnungen. Es ersetzt keine medizinische, psychologische oder sportliche Beratung.',
    t2: 'Deine Verantwortung', t2a: 'Wähle und absolviere Routinen unter Berücksichtigung deiner Gesundheit, Verfassung und Grenzen.',
    t3: 'Daten', t3a: 'Daten werden auf deinem Gerät gespeichert. Du bist für Geräteschutz und Backups bei Löschung, Schaden oder Systemfehlern verantwortlich.',
    t4: 'Geistiges Eigentum', t4a: 'East Noise besitzt Code, Design, Texte und Standardbilder der App. Rechte an selbst gewählten Fotos verbleiben beim Nutzer.',
    t5: 'Änderungen', t5a: 'Diese Bedingungen können wegen rechtlicher oder dienstlicher Änderungen aktualisiert werden.',
  },
  fr: {
    language: 'Langue', support: 'Assistance', privacy: 'Politique de confidentialité', terms: "Conditions d’utilisation", updated: 'En vigueur le 17 juillet 2026',
    homeTitle: 'Reconstruis-toi par la répétition.', homeLead: 'ALPHA est un programme de discipline et de réflexion sur 30 jours, de BASIC à HARD.',
    supportTitle: 'Assistance ALPHA', supportLead: 'Si quelque chose ne fonctionne pas, consulte les réponses ou contacte-nous.',
    faq1: 'Où ma progression est-elle stockée ?', faq1a: 'Les routines, la progression, les clôtures, les réflexions et les images choisies sont stockées sur ton appareil.',
    faq2: 'Mes données restent-elles après la suppression ?', faq2a: 'Supprimer l’app peut aussi supprimer ses données locales. ALPHA ne propose ni compte ni sauvegarde cloud.',
    faq3: 'Les images des cartes sont-elles envoyées ?', faq3a: 'Non. Les images choisies et recadrées sont traitées et stockées uniquement sur ton appareil.',
    faq4: 'Je ne reçois pas de rappels.', faq4a: 'Vérifie que les notifications ALPHA sont autorisées. Les rappels sont programmés localement.',
    contact: 'Contact', contactLead: 'Indique le modèle, la version du système, la version de l’app et décris le problème.',
    privacyTitle: 'Politique de confidentialité', privacyLead: 'ALPHA ne collecte aucune donnée personnelle et ne la transmet à aucun serveur externe.',
    p1: 'Données collectées', p1a: 'ALPHA ne collecte ni nom, ni e-mail, ni position, ni contacts, ni identifiant publicitaire, ni analyse, ni donnée de paiement.',
    p2: 'Données sur l’appareil', p2a: 'Routines, journal, réflexions, réglages et images sont stockés sur ton appareil pour fournir les fonctions. Le développeur ne peut pas y accéder.',
    p3: 'Accès aux photos', p3a: 'ALPHA accède uniquement à la photo choisie pour une carte. Elle est modifiée sur l’appareil et n’est jamais envoyée.',
    p4: 'Notifications', p4a: 'Avec ton accord, ALPHA programme localement un rappel de clôture. Aucun serveur push distant ni suivi n’est utilisé.',
    p5: 'Paiements', p5a: 'Apple App Store ou Google Play traite les achats. Le développeur d’ALPHA ne collecte aucune donnée de paiement.',
    p6: 'Sauvegarde et suppression', p6a: 'Les données peuvent figurer dans les sauvegardes de l’appareil selon le système. Supprime l’app ou réinitialise-la pour effacer les données locales.',
    p7: 'Vie privée des enfants', p7a: 'ALPHA ne collecte intentionnellement les données personnelles de personne.',
    p8: 'Modifications et contact', p8a: 'En cas de modification, la date d’entrée en vigueur sera actualisée. Contacte-nous à l’adresse ci-dessous.',
    termsTitle: "Conditions d’utilisation", termsLead: 'En téléchargeant ou utilisant ALPHA, tu acceptes ces conditions.',
    t1: 'Service', t1a: 'ALPHA est un outil de gestion personnelle et de journal. Il ne fournit aucun avis médical, psychologique ou sportif.',
    t2: 'Ta responsabilité', t2a: 'Choisis et réalise les routines en tenant compte de ta santé, de ta condition et de tes limites.',
    t3: 'Données', t3a: 'Les données sont stockées sur ton appareil. Tu es responsable de sa gestion et des sauvegardes face à la suppression, aux dommages ou aux pannes.',
    t4: 'Propriété intellectuelle', t4a: 'East Noise détient le code, le design, les textes et les visuels par défaut. Les utilisateurs conservent les droits sur leurs photos.',
    t5: 'Modifications', t5a: 'Ces conditions peuvent évoluer pour refléter des changements juridiques ou du service.',
  },
  zh: {
    language: '语言', support: '支持', privacy: '隐私政策', terms: '使用条款', updated: '2026年7月17日起生效',
    homeTitle: '在重复中重塑自己。', homeLead: 'ALPHA是一套从BASIC进阶到HARD的30天自律与复盘计划。',
    supportTitle: 'ALPHA 支持', supportLead: '如果遇到问题，请先查看以下内容或联系我们。',
    faq1: '进度保存在哪里？', faq1a: '习惯、进度、每日结算、复盘和所选卡片图片都保存在你的设备上。',
    faq2: '删除应用后数据还在吗？', faq2a: '删除应用时，本地数据也可能被删除。ALPHA不提供账户或云端备份。',
    faq3: '卡片图片会被上传吗？', faq3a: '不会。你选择和裁剪的图片只会在设备上处理和保存。',
    faq4: '为什么收不到提醒？', faq4a: '请确认设备设置中已允许ALPHA发送通知。提醒只在设备上本地安排。',
    contact: '联系我们', contactLead: '请附上设备型号、系统版本、应用版本和问题说明。',
    privacyTitle: '隐私政策', privacyLead: 'ALPHA不收集个人数据，也不会将数据发送到外部服务器。',
    p1: '我们收集的数据', p1a: 'ALPHA不收集姓名、邮箱、位置、联系人、广告标识符、分析数据或支付信息。',
    p2: '设备上的数据', p2a: '习惯、记录、复盘、设置和卡片图片保存在设备上以提供功能。开发者无法访问这些数据。',
    p3: '照片访问', p3a: '更换卡片图片时，ALPHA只访问你主动选择的照片。图片在设备上编辑，不会上传。',
    p4: '通知', p4a: '经你允许，ALPHA会在设备上本地安排每日结算提醒。不会使用远程推送服务器或追踪。',
    p5: '支付', p5a: '购买由Apple App Store或Google Play处理。ALPHA开发者不收集支付信息。',
    p6: '备份与删除', p6a: '根据系统设置，应用数据可能包含在设备备份中。删除应用或使用重置功能即可删除本地数据。',
    p7: '儿童隐私', p7a: 'ALPHA不会有意收集任何人的个人数据。',
    p8: '变更与联系', p8a: '政策变更时，我们会更新本页生效日期。如有问题，请发送邮件。',
    termsTitle: '使用条款', termsLead: '下载或使用ALPHA即表示你同意以下条款。',
    t1: '服务', t1a: 'ALPHA是一款自我管理和记录工具，不提供医疗、心理或运动处方。',
    t2: '用户责任', t2a: '请选择符合自身健康、状态和能力范围的习惯并谨慎执行。',
    t3: '数据', t3a: '数据保存在设备上。用户应自行管理设备和备份，以防删除、损坏或系统故障造成数据丢失。',
    t4: '知识产权', t4a: '应用代码、设计、文案和默认视觉素材归East Noise所有。用户对自己选择的照片保留相应权利。',
    t5: '变更', t5a: '我们可能根据法律或服务变化更新本条款。',
  },
};

for (const locale of Object.keys(localizedChrome)) {
  copy[locale] = { ...copy.en, ...localizedChrome[locale] };
}

function detectLocale() {
  const saved = localStorage.getItem('alpha-site-locale');
  if (locales.includes(saved)) return saved;
  const browser = (navigator.language || 'en').toLowerCase();
  if (browser.startsWith('ko')) return 'ko';
  if (browser.startsWith('ja')) return 'ja';
  if (browser.startsWith('es')) return 'es';
  if (browser.startsWith('de')) return 'de';
  if (browser.startsWith('fr')) return 'fr';
  if (browser.startsWith('zh')) return 'zh';
  return 'en';
}

function render(locale) {
  const t = copy[locale];
  document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : locale;
  document.querySelectorAll('[data-copy]').forEach((element) => {
    const key = element.dataset.copy;
    if (t[key]) element.textContent = t[key];
  });
  document.title = `${document.body.dataset.pageTitle || t.brand} · ${t.brand}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const selector = document.querySelector('#locale');
  const locale = detectLocale();
  selector.value = locale;
  selector.setAttribute('aria-label', copy[locale].language);
  selector.addEventListener('change', () => {
    localStorage.setItem('alpha-site-locale', selector.value);
    render(selector.value);
  });
  render(locale);
});
