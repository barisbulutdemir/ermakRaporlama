# Unraid Üzerinde En Kolay Kurulum Yöntemi (GitHub ile)

Bu yöntemle kodları direkt GitHub'dan çekeceğiz. Güncelleme yapmak istediğinizde tek komutla yeni kodları alabileceksiniz.

## Kurulum Yöntemi: Unraid Docker Compose (Stack)

En temiz ve yönetilebilir yöntem, Unraid'in **Docker Compose Manager** eklentisini kullanmaktır. Bu sayede uygulamanızı bir "Stack" olarak görür ve yönetirsiniz.

### Adım 1: Eklentiyi Kurun
1.  Unraid'de **Apps** sekmesine gidin.
2.  **"Docker Compose Manager"** eklentisini aratıp yükleyin.

### Adım 2: Stack Oluşturun
1.  Unraid **Docker** sekmesine gelin.
2.  En altta **"Compose"** bölümünü göreceksiniz.
3.  **"ADD NEW STACK"** butonuna tıklayın.
4.  İsim olarak `ermakRaporlama` yazın ve **CREATE STACK** deyin.

### Adım 3: Kodları İndirin
1.  Oluşturduğunuz `ermakRaporlama` stack'inin yanındaki **Terminal İkonuna** ( >_ ) tıklayın. (Bu işlem o klasörde terminal açar).
2.  Açılan terminale şu komutu yapıştırın (kodları indirir):
    ```bash
    git clone https://github.com/barisbulutdemir/ermakRaporlama.git .
    ```
    *(Dikkat: Komutun sonundaki nokta (.) önemlidir, dosyaları o anki klasöre indirir).*

### Adım 4: Ayarlar ve Başlatma
1.  Terminali kapatın.
2.  Stack ismine (`ermakRaporlama`) tıklayın, ardından **"EDIT STACK"** butonuna basın.
3.  `Compose File` alanında `docker-compose.yml` içeriğini göreceksiniz.
    *   **ÖNEMLİ:** `AUTH_SECRET` kısmını rastgele bir şifre ile değiştirin.
4.  **"SAVE CHANGES"** butonuna basın.
5.  Son olarak **"COMPOSE UP"** butonuna tıklayın.

Docker imajı oluşturulacak (Build) ve proje ayağa kalkacaktır.
Uygulamanıza `http://UNRAID_IP_ADRESI:3000` adresinden erişebilirsiniz.

---

## Güncelleme Nasıl Yapılır?

Kodlarda değişiklik yaptığınızda Unraid üzerindeki sürümü güncellemek için:

1.  Unraid **Docker** sekmesinde `ermakRaporlama` stack'inin yanındaki **Terminal** ikonuna tıklayın.
2.  Şunu yazın: `git pull`
3.  Terminali kapatın.
4.  Stack üzerindeki **"COMPOSE UP"** butonuna tekrar basın. (Otomatik olarak yeni versiyonu build edip başlatır).
5.  *Eğer veritabanı değişikliği varsa:* Terminalde `docker-compose exec ermak-rapor-app npx prisma migrate deploy` komutunu çalıştırın.

## Önemli Notlar

*   **Veritabanı:** Verileriniz (`prisma` klasörü) ve Resimler (`uploads` klasörü) bu klasörün içinde güvende kalır. Güncelleme yapsanız bile silinmez.
*   **Gizli Anahtar (Auth Secret):** `docker-compose.yml` dosyasındaki `AUTH_SECRET` değerini değiştirmeniz önerilir. Rastgele bir değer oluşturmak için terminalde şu komutu çalıştırabilirsiniz:
    ```bash
    openssl rand -base64 32
    ```
*   **Port:** Eğer 3000 portu doluysa `docker-compose.yml` dosyasını açıp değiştirebilirsiniz (`nano docker-compose.yml`).

