/** Отображение данных */
export { ContentEmptyState } from './data-display/ContentEmptyState/ContentEmptyState'; // Отображает пустое состояние раздела.
export { ContentState } from './data-display/ContentState/ContentState'; // Показывает загрузку, ошибку, пустое состояние или содержимое.
export { EmptyState } from './data-display/EmptyState/EmptyState'; // Отображает заглушку при отсутствии данных.
export { EntityActions } from './data-display/EntityActions/EntityActions'; // Отображает действия над сущностью.
export { EntityContent } from './data-display/EntityContent/EntityContent'; // Отображает содержимое сущности.
export { EntityDates } from './data-display/EntityDates/EntityDates'; // Отображает даты сущности.
export { EntityHeader } from './data-display/EntityHeader/EntityHeader'; // Отображает заголовок сущности.
export { EntityInfoList } from './data-display/EntityInfoList/EntityInfoList'; // Отображает список сведений о сущности.
export { EntityMeta } from './data-display/EntityMeta/EntityMeta'; // Отображает краткие сведения о сущности.
export { EntityStats } from './data-display/EntityStats/EntityStats'; // Отображает показатели сущности.
export { Stat } from './data-display/Stat/Stat'; // Отображает один показатель.
/** Обратная связь */
export { Alert } from './feedback/Alert/Alert'; // Отображает предупреждение с заголовком и текстом.
export { ConfirmDialog } from './feedback/ConfirmDialog/ConfirmDialog'; // Запрашивает подтверждение действия.
export { ContentRefetchOverlay } from './feedback/ContentRefetchOverlay/ContentRefetchOverlay'; // Показывает наложение при обновлении содержимого.
export { Loading } from './feedback/Loading/Loading'; // Отображает индикатор загрузки.
export { PageLoader } from './feedback/PageLoader/PageLoader'; // Отображает загрузку страницы.
export { Skeleton } from './feedback/Skeleton/Skeleton'; // Отображает каркас загрузки.
export { SkeletonText } from './feedback/Skeleton/SkeletonText'; // Отображает каркас загрузки из нескольких строк.
export { ToastProvider } from './feedback/Toast/ToastContext'; // Предоставляет всплывающие уведомления.
export { useToast } from './feedback/Toast/ToastContext'; // Возвращает методы показа всплывающих уведомлений.
/** Формы */
export { Checkbox } from './form/Checkbox/Checkbox'; // Отображает флажок с подписью.
export { FileInput } from './form/FileInput/FileInput'; // Принимает файл и показывает ход загрузки.
export { Input } from './form/Input/Input'; // Отображает поле ввода.
export { SearchField } from './form/SearchField/SearchField'; // Отображает поле поиска.
export { SegmentedControl } from './form/SegmentedControl/SegmentedControl'; // Переключает один вариант из нескольких.
export { Select } from './form/Select/Select'; // Отображает раскрывающийся список.
export { TextArea } from './form/TextArea/TextArea'; // Отображает многострочное поле ввода.
/** Раскладка */
export { ActionsBar } from './layout/ActionsBar/ActionsBar'; // Отображает ряд кнопок действий.
export { BaseCard } from './layout/BaseCard/BaseCard'; // Собирает карточку из заголовка, обложки и содержимого.
export { Card } from './layout/Card/Card'; // Отображает карточку.
export { ErrorBoundary } from './layout/ErrorBoundary/ErrorBoundary'; // Перехватывает ошибку отрисовки и показывает запасной экран.
export { PageLayout } from './layout/PageLayout/PageLayout'; // Отображает заголовок и содержимое страницы.
export { SectionCard } from './layout/SectionCard/SectionCard'; // Отображает раздел страницы.
export { Tabs } from './layout/Tabs/Tabs'; // Переключает вкладки.
export { Toolbar } from './layout/Toolbar/Toolbar'; // Отображает панель инструментов.
/** Медиа */
export { MediaPreview } from './media/MediaPreview/MediaPreview'; // Показывает изображение и предварительный просмотр видео.
/** Навигация */
export { InfiniteScrollFooter } from './navigation/InfiniteScrollFooter/InfiniteScrollFooter'; // Отображает состояние подгрузки при прокрутке.
export { ScrollNavigationButton } from './navigation/ScrollNavigationButton/ScrollNavigationButton'; // Прокручивает к началу или к форме.
export { ScrollToTop } from './navigation/ScrollTop/ScrollToTop'; // Прокручивает страницу к началу при смене адреса.
/** Наложения */
export { Dropdown } from './overlay/Dropdown/Dropdown'; // Отображает список сортировки.
export { Modal } from './overlay/Modal/Modal'; // Отображает модальное окно.
/** Базовые элементы */
export { ActionChip } from './primitives/ActionChip/ActionChip'; // Отображает компактную кнопку действия.
export { Avatar } from './primitives/Avatar/Avatar'; // Отображает аватар и индикатор присутствия.
export { Badge } from './primitives/Badge/Badge'; // Отображает значок.
export { Button } from './primitives/Button/Button'; // Отображает кнопку.
export { ButtonGroup } from './primitives/ButtonGroup/ButtonGroup'; // Выравнивает группу кнопок.
export { Chip } from './primitives/Chip/Chip'; // Переключает фильтр.
export { IconButton } from './primitives/IconButton/IconButton'; // Отображает кнопку с иконкой.
export { Image } from './primitives/Image/Image'; // Показывает изображение и подставляет запасной адрес при ошибке.
export { RichText } from './primitives/RichText/RichText'; // Отображает текст с абзацами и переносами строк.
export { StatusBadge } from './primitives/StatusBadge/StatusBadge'; // Отображает значок статуса.
export { Text } from './primitives/Text/Text'; // Отображает текст.
